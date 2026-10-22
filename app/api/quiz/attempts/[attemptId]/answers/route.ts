// app/api/quiz/attempts/[attemptId]/answers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();
    const attemptQuestionId =
      typeof body.attemptQuestionId === "string" ? body.attemptQuestionId : "";
    const selectedOptionId =
      typeof body.selectedOptionId === "string" ? body.selectedOptionId : null;

    if (!attemptQuestionId) {
      return NextResponse.json(
        { error: "Soal tidak valid." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.quizAttemptQuestion.findFirst({
        where: { id: attemptQuestionId, attemptId },
        include: {
          answer: true,
          question: { include: { options: true } },
          attempt: { select: { id: true, status: true } },
        },
      });

      if (!item) throw new Error("QUESTION_NOT_FOUND");
      if (item.attempt.status !== "IN_PROGRESS") {
        throw new Error("ATTEMPT_FINISHED");
      }
      if (item.answer) throw new Error("ALREADY_ANSWERED");

      const firstUnanswered = await tx.quizAttemptQuestion.findFirst({
        where: { attemptId, answer: { is: null } },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      if (firstUnanswered?.id !== item.id) {
        throw new Error("INVALID_ORDER");
      }

      const now = new Date();

      if (!item.questionStartedAt) {
        throw new Error("QUESTION_NOT_STARTED");
      }

      const startedAt = item.questionStartedAt;
      const elapsedMs = Math.max(0, now.getTime() - startedAt.getTime());
      const timeLimitMs = item.timeLimitSeconds * 1000;
      const expired = elapsedMs > timeLimitMs + 250;

      const selectedOption = selectedOptionId
        ? item.question.options.find((option) => option.id === selectedOptionId)
        : null;

      if (selectedOptionId && !selectedOption) {
        throw new Error("INVALID_OPTION");
      }
      if (!selectedOption && !expired) {
        throw new Error("ANSWER_REQUIRED");
      }

      const isCorrect = !expired && selectedOption?.isCorrect === true;

      // Bonus kecepatan maksimal 500 poin.
      const maxBonus = 500;
      const responseTimeMs = Math.min(elapsedMs, timeLimitMs);
      const basePoints = isCorrect ? item.points : 0;
      const bonusPoints = isCorrect
        ? Math.floor(
            maxBonus * Math.max(0, 1 - responseTimeMs / timeLimitMs),
          )
        : 0;
      const pointsEarned = basePoints + bonusPoints;

      await tx.quizAttemptAnswer.create({
        data: {
          attemptQuestionId: item.id,
          selectedOptionId: selectedOption?.id ?? null,
          selectedOptionText: selectedOption?.text ?? null,
          isCorrect,
          basePoints,
          bonusPoints,
          pointsEarned,
          responseTimeMs,
        },
      });

      const otherQuestions = await tx.quizAttemptQuestion.findMany({
        where: { attemptId, id: { not: item.id } },
        select: { answer: { select: { id: true } } },
      });

      const completed = otherQuestions.every(
        (question) => question.answer !== null,
      );

      await tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          score: { increment: pointsEarned },
          ...(completed ? { status: "COMPLETED", completedAt: now } : {}),
        },
      });

      const correctOption = item.question.options.find(
        (option) => option.isCorrect,
      );

      return {
        isCorrect,
        expired,
        basePoints,
        bonusPoints,
        pointsEarned,
        selectedOptionId: selectedOption?.id ?? null,
        correctOptionId: correctOption?.id ?? null,
        correctOptionText: correctOption?.text ?? null,
        explanation: item.explanationSnapshot,
        completed,
        nextPosition: completed ? null : item.position + 1,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    const errors: Record<string, { status: number; text: string }> = {
      QUESTION_NOT_FOUND: {
        status: 404,
        text: "Soal tidak ditemukan.",
      },
      ATTEMPT_FINISHED: {
        status: 409,
        text: "Kuis sudah selesai.",
      },
      ALREADY_ANSWERED: {
        status: 409,
        text: "Soal ini sudah dijawab.",
      },
      INVALID_ORDER: {
        status: 409,
        text: "Kerjakan soal secara berurutan.",
      },
      INVALID_OPTION: {
        status: 400,
        text: "Pilihan jawaban tidak valid.",
      },
      ANSWER_REQUIRED: {
        status: 400,
        text: "Pilih jawaban terlebih dahulu.",
      },
      QUESTION_NOT_STARTED: {
        status: 409,
        text: "Mulai soal terlebih dahulu.",
      },
    };

    const knownError = errors[message];

    if (knownError) {
      return NextResponse.json(
        { error: knownError.text },
        { status: knownError.status },
      );
    }

    console.error("[POST /api/quiz/attempts/[attemptId]/answers]", error);

    return NextResponse.json(
      { error: "Gagal memproses jawaban." },
      { status: 500 },
    );
  }
}