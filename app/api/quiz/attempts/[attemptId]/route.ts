// app/api/quiz/attempts/[attemptId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ attemptId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        nickname: true,
        score: true,
        totalPoints: true,
        status: true,
        startedAt: true,
        completedAt: true,
        phenomenon: { select: { title: true, slug: true } },
        questions: {
          orderBy: { position: "asc" },
          select: {
            position: true,
            questionTextSnapshot: true,
            explanationSnapshot: true,
            difficulty: true,
            points: true,
            answer: {
              select: {
                isCorrect: true,
                pointsEarned: true,
                selectedOptionText: true,
                responseTimeMs: true,
              },
            },
            question: {
              select: {
                options: {
                  where: { isCorrect: true },
                  select: { text: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Hasil kuis tidak ditemukan." },
        { status: 404 },
      );
    }

    const correctCount = attempt.questions.filter(
      (question) => question.answer?.isCorrect,
    ).length;

    return NextResponse.json({
      id: attempt.id,
      nickname: attempt.nickname,
      phenomenon: attempt.phenomenon,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage:
        attempt.totalPoints > 0
          ? Math.round((attempt.score / attempt.totalPoints) * 100)
          : 0,
      correctCount,
      questionCount: attempt.questions.length,
      status: attempt.status,
      completedAt: attempt.completedAt,
      questions: attempt.questions.map((question) => ({
        position: question.position,
        text: question.questionTextSnapshot,
        explanation: question.explanationSnapshot,
        difficulty: question.difficulty,
        isCorrect: question.answer?.isCorrect ?? false,
        selectedOptionText: question.answer?.selectedOptionText ?? null,
        correctOptionText: question.question.options[0]?.text ?? null,
        pointsEarned: question.answer?.pointsEarned ?? 0,
        responseTimeMs: question.answer?.responseTimeMs ?? null,
      })),
    });
  } catch (error) {
    console.error("[GET /api/quiz/attempts/[attemptId]]", error);
    return NextResponse.json(
      { error: "Gagal mengambil hasil kuis." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { attemptId } = await params;

    const deleted = await prisma.quizAttempt.deleteMany({
      where: { id: attemptId, status: "IN_PROGRESS" },
    });

    if (deleted.count === 0) {
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        select: { id: true, status: true },
      });

      if (!attempt) {
        return NextResponse.json(
          { error: "Percobaan kuis tidak ditemukan." },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { error: "Hanya kuis yang masih aktif yang dapat dihapus." },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/quiz/attempts/[attemptId]]", error);
    return NextResponse.json(
      { error: "Gagal menghapus percobaan kuis." },
      { status: 500 },
    );
  }
}