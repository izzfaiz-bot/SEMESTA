// app/api/quiz/attempts/[attemptId]/questions/[attemptQuestionId]/answer/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const speedBonusByDuration: Record<number, number> = {
  30: 500,
  45: 400,
  60: 300,
  90: 200,
};

type RouteContext = {
  params: Promise<{ attemptId: string; attemptQuestionId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { attemptId, attemptQuestionId } = await params;
    const body = await request.json().catch(() => ({}));
    const selectedOptionId =
      typeof body.selectedOptionId === "string" ? body.selectedOptionId : null;

    const result = await prisma.$transaction(async (tx) => {
      const question = await tx.quizAttemptQuestion.findFirst({
        where: { id: attemptQuestionId, attemptId },
        select: {
          id: true,
          points: true,
          timeLimitSeconds: true,
          questionStartedAt: true,
          answer: { select: { id: true } },
          attempt: { select: { id: true, status: true } },
          question: {
            select: {
              options: {
                select: { id: true, text: true, isCorrect: true },
              },
            },
          },
        },
      });

      if (!question) {
        return { error: "Soal tidak ditemukan.", status: 404 as const };
      }

      if (question.attempt.status !== "IN_PROGRESS") {
        return { error: "Kuis sudah tidak aktif.", status: 409 as const };
      }

      if (question.answer) {
        return { error: "Soal ini sudah diselesaikan.", status: 409 as const };
      }

      if (!question.questionStartedAt) {
        return { error: "Buka soal terlebih dahulu.", status: 409 as const };
      }

      const now = new Date();
      const elapsedMs = Math.max(
        0,
        now.getTime() - question.questionStartedAt.getTime(),
      );
      const limitMs = question.timeLimitSeconds * 1000;
      const expired = elapsedMs >= limitMs;

      if (!selectedOptionId && !expired) {
        return {
          error: "Pilih jawaban sebelum waktu habis.",
          status: 400 as const,
        };
      }

      const selectedOption = selectedOptionId
        ? question.question.options.find(
            (option) => option.id === selectedOptionId,
          )
        : null;

      if (selectedOptionId && !selectedOption) {
        return {
          error: "Pilihan jawaban tidak valid.",
          status: 400 as const,
        };
      }

      const isCorrect = !expired && selectedOption?.isCorrect === true;
      const responseTimeMs = Math.min(elapsedMs, limitMs);
      const maxBonus = speedBonusByDuration[question.timeLimitSeconds] ?? 0;
      const bonusPoints = isCorrect
        ? Math.floor(maxBonus * (1 - responseTimeMs / limitMs))
        : 0;
      const basePoints = isCorrect ? question.points : 0;
      const pointsEarned = basePoints + bonusPoints;

      await tx.quizAttemptAnswer.create({
        data: {
          attemptQuestionId: question.id,
          selectedOptionId: expired ? null : selectedOption?.id ?? null,
          selectedOptionText: expired ? null : selectedOption?.text ?? null,
          isCorrect,
          basePoints,
          bonusPoints,
          pointsEarned,
          responseTimeMs,
          answeredAt: now,
        },
      });

      await tx.quizAttempt.update({
        where: { id: question.attempt.id },
        data: { score: { increment: pointsEarned } },
      });

      const [answeredCount, totalQuestions] = await Promise.all([
        tx.quizAttemptAnswer.count({
          where: { attemptQuestion: { attemptId } },
        }),
        tx.quizAttemptQuestion.count({ where: { attemptId } }),
      ]);

      const completed = answeredCount >= totalQuestions;

      if (completed) {
        await tx.quizAttempt.updateMany({
          where: { id: attemptId, status: "IN_PROGRESS" },
          data: { status: "COMPLETED", completedAt: now },
        });
      }

      return {
        data: {
          questionId: question.id,
          isCorrect,
          expired,
          pointsEarned,
          basePoints,
          bonusPoints,
          responseTimeMs,
          answeredCount,
          totalQuestions,
          completed,
        },
      };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? error.code
        : null;

    if (code === "P2002") {
      return NextResponse.json(
        { error: "Soal ini sudah diselesaikan." },
        { status: 409 },
      );
    }

    console.error("[POST quiz answer]", error);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban." },
      { status: 500 },
    );
  }
}