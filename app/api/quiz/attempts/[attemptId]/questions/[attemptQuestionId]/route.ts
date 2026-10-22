// app/api/quiz/attempts/[attemptId]/questions/[attemptQuestionId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string; attemptQuestionId: string }> },
) {
  try {
    const { attemptId, attemptQuestionId } = await params;

    const question = await prisma.quizAttemptQuestion.findFirst({
      where: { id: attemptQuestionId, attemptId },
      select: {
        id: true,
        position: true,
        questionTextSnapshot: true,
        difficulty: true,
        points: true,
        timeLimitSeconds: true,
        questionStartedAt: true,
        answer: { select: { id: true } },
        attempt: { select: { status: true } },
        question: {
          select: {
            options: {
              orderBy: { sortOrder: "asc" },
              select: { id: true, text: true },
            },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 });
    }

    if (question.attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Kuis sudah tidak aktif." }, { status: 409 });
    }

    if (question.answer) {
      return NextResponse.json({ error: "Soal ini sudah diselesaikan." }, { status: 409 });
    }

    let questionStartedAt = question.questionStartedAt;

    if (!questionStartedAt) {
      const startedAt = new Date();
      const updated = await prisma.quizAttemptQuestion.updateMany({
        where: {
          id: question.id,
          attemptId,
          questionStartedAt: null,
        },
        data: { questionStartedAt: startedAt },
      });

      const refreshed = await prisma.quizAttemptQuestion.findUnique({
        where: { id: question.id },
        select: { questionStartedAt: true, answer: { select: { id: true } } },
      });

      if (!refreshed?.questionStartedAt || refreshed.answer) {
        return NextResponse.json({ error: "Soal tidak dapat dibuka." }, { status: 409 });
      }

      questionStartedAt = refreshed.questionStartedAt;
    }

    const elapsedSeconds = Math.max(
      0,
      Math.floor((Date.now() - questionStartedAt.getTime()) / 1000),
    );
    const remainingSeconds = Math.max(0, question.timeLimitSeconds - elapsedSeconds);

    if (remainingSeconds <= 0) {
      return NextResponse.json({
        expired: true,
        questionId: question.id,
        remainingSeconds: 0,
        questionStartedAt: questionStartedAt.toISOString(),
      });
    }

    return NextResponse.json({
      expired: false,
      question: {
        id: question.id,
        position: question.position,
        text: question.questionTextSnapshot,
        difficulty: question.difficulty,
        points: question.points,
        timeLimitSeconds: question.timeLimitSeconds,
        questionStartedAt: questionStartedAt.toISOString(),
        remainingSeconds,
        options: question.question.options,
      },
    });
  } catch (error) {
    console.error("[POST /api/quiz/attempts/[attemptId]/questions/[attemptQuestionId]]", error);
    return NextResponse.json({ error: "Gagal membuka soal." }, { status: 500 });
  }
}