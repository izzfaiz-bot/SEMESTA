// app/api/quiz/attempts/[attemptId]/play/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        nickname: true,
        status: true,
        startedAt: true,
        phenomenon: {
          select: {
            title: true,
            slug: true,
          },
        },
        questions: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            position: true,
            questionTextSnapshot: true,
            difficulty: true,
            points: true,
            timeLimitSeconds: true,
            questionStartedAt: true,
            answer: {
              select: {
                id: true,
                isCorrect: true,
                selectedOptionId: true,
                pointsEarned: true,
                answeredAt: true,
              },
            },
            question: {
              select: {
                options: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    id: true,
                    text: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Percobaan kuis tidak ditemukan." },
        { status: 404 },
      );
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Percobaan kuis ini sudah tidak aktif." },
        { status: 409 },
      );
    }

    const questions = attempt.questions.map((question) => {
      const answer = question.answer;

      return {
        id: question.id,
        position: question.position,
        text: question.questionTextSnapshot,
        difficulty: question.difficulty,
        points: question.points,
        timeLimitSeconds: question.timeLimitSeconds,
        questionStartedAt: question.questionStartedAt,
        answered: answer !== null,
        isCorrect: answer?.isCorrect ?? null,
        timedOut: answer !== null && answer.selectedOptionId === null,
        pointsEarned: answer?.pointsEarned ?? 0,
        answeredAt: answer?.answeredAt ?? null,
        options: question.question.options.map((option) => ({
          id: option.id,
          text: option.text,
        })),
      };
    });

    return NextResponse.json({
      attemptId: attempt.id,
      nickname: attempt.nickname,
      phenomenon: attempt.phenomenon,
      startedAt: attempt.startedAt,
      questionCount: questions.length,
      questions,
    });
  } catch (error) {
    console.error("[GET /api/quiz/attempts/[attemptId]/play]", error);

    return NextResponse.json(
      { error: "Gagal memuat soal kuis." },
      { status: 500 },
    );
  }
}