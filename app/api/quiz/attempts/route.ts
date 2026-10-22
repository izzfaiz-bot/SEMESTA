// app/api/quiz/attempts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type DifficultyFilter = "EASY" | "MEDIUM" | "HARD" | "RANDOM";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const nickname = typeof body.nickname === "string" ? body.nickname.trim().slice(0, 40) : "";
    const difficulty: DifficultyFilter = body.difficulty;
    const durationSeconds = Number(body.durationSeconds);
    const requestedCount = Number(body.questionCount);

    if (!slug) {
      return NextResponse.json({ error: "Materi belum dipilih." }, { status: 400 });
    }

    if (!["EASY", "MEDIUM", "HARD", "RANDOM"].includes(difficulty)) {
      return NextResponse.json({ error: "Tingkat kesulitan tidak valid." }, { status: 400 });
    }

    if (![30, 45, 60, 90].includes(durationSeconds)) {
      return NextResponse.json({ error: "Durasi soal tidak valid." }, { status: 400 });
    }

    const phenomenon = await prisma.phenomenon.findFirst({
      where: { slug, isPublished: true },
      select: { id: true, categoryId: true, title: true },
    });

    if (!phenomenon) {
      return NextResponse.json({ error: "Materi tidak ditemukan atau belum dipublikasikan." }, { status: 404 });
    }

    const questionCount = Math.min(
      30,
      Math.max(1, Number.isInteger(requestedCount) && requestedCount > 0 ? requestedCount : 10),
    );

    const questions = await prisma.question.findMany({
      where: {
        phenomenonId: phenomenon.id,
        isPublished: true,
        isArchived: false,
        ...(difficulty !== "RANDOM" ? { difficulty } : {}),
      },
      select: {
        id: true,
        text: true,
        explanation: true,
        difficulty: true,
        points: true,
        options: { select: { id: true } },
      },
    });

    const selectedQuestions = shuffle(questions).slice(0, questionCount);

    if (selectedQuestions.length === 0) {
      return NextResponse.json(
        { error: "Belum ada soal yang dipublikasikan untuk pilihan tingkat kesulitan ini." },
        { status: 404 },
      );
    }

    if (selectedQuestions.some((question) => question.options.length < 2)) {
      return NextResponse.json(
        { error: "Ada soal yang belum memiliki minimal dua pilihan jawaban." },
        { status: 400 },
      );
    }

    const speedBonusMaxPoints = 500;
    const totalPoints = selectedQuestions.reduce(
      (sum, question) => sum + question.points + speedBonusMaxPoints,
      0,
    );

    const attempt = await prisma.quizAttempt.create({
      data: {
        nickname: nickname || null,
        categoryId: phenomenon.categoryId,
        phenomenonId: phenomenon.id,
        totalPoints,
        questions: {
          create: selectedQuestions.map((question, index) => ({
            questionId: question.id,
            position: index + 1,
            questionTextSnapshot: question.text,
            explanationSnapshot: question.explanation,
            difficulty: question.difficulty,
            points: question.points,
            timeLimitSeconds: durationSeconds,
          })),
        },
      },
      select: {
        id: true,
        questions: { select: { id: true } },
      },
    });

    return NextResponse.json(
      {
        attemptId: attempt.id,
        questionCount: attempt.questions.length,
        phenomenonTitle: phenomenon.title,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/quiz/attempts]", error);

    return NextResponse.json(
      { error: "Gagal memulai kuis. Silakan periksa log terminal server." },
      { status: 500 },
    );
  }
}