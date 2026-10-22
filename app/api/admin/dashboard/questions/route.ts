// app/api/admin/dashboard/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/admin-session";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
const SOURCES = ["WEBSITE", "TEACHER"] as const;

type OptionInput = {
  text: string;
  isCorrect: boolean;
};

type QuestionInput = {
  phenomenonId: string;
  text: string;
  explanation: string;
  difficulty: string;
  points: number;
  source?: string;
  options: OptionInput[];
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function validateQuestion(body: QuestionInput) {
  if (!body || typeof body !== "object") return "Data soal tidak valid.";
  if (typeof body.phenomenonId !== "string" || !body.phenomenonId.trim()) {
    return "Fenomena wajib dipilih.";
  }
  if (typeof body.text !== "string" || !body.text.trim()) {
    return "Pertanyaan wajib diisi.";
  }
  if (body.text.trim().length > 10000) {
    return "Pertanyaan maksimal 10.000 karakter.";
  }
  if (typeof body.explanation !== "string" || !body.explanation.trim()) {
    return "Pembahasan wajib diisi.";
  }
  if (!DIFFICULTIES.includes(body.difficulty as (typeof DIFFICULTIES)[number])) {
    return "Tingkat kesulitan tidak valid.";
  }
  if (
    !Number.isInteger(body.points) ||
    body.points < 0 ||
    body.points > 100000
  ) {
    return "Poin harus berupa bilangan bulat antara 0 dan 100.000.";
  }
  if (
    body.source !== undefined &&
    !SOURCES.includes(body.source as (typeof SOURCES)[number])
  ) {
    return "Sumber soal tidak valid.";
  }
  if (!Array.isArray(body.options) || body.options.length !== 4) {
    return "Soal harus memiliki tepat 4 pilihan jawaban.";
  }
  if (
    body.options.some(
      (option) =>
        !option ||
        typeof option.text !== "string" ||
        !option.text.trim() ||
        typeof option.isCorrect !== "boolean",
    )
  ) {
    return "Semua pilihan jawaban wajib diisi dengan benar.";
  }
  if (body.options.filter((option) => option.isCorrect).length !== 1) {
    return "Pilih tepat satu jawaban yang benar.";
  }

  return null;
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return errorResponse("Akses ditolak.", 401);

    const questions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        phenomenon: {
          select: {
            id: true,
            title: true,
            category: {
              select: {
                id: true,
                name: true,
                emoji: true,
              },
            },
          },
        },
        options: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            text: true,
            isCorrect: true,
            sortOrder: true,
          },
        },
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("GET /api/admin/dashboard/questions:", error);
    return NextResponse.json(
      { message: "Gagal memuat bank soal." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return errorResponse("Akses ditolak.", 401);

    let body: QuestionInput;

    try {
      body = (await request.json()) as QuestionInput;
    } catch {
      return errorResponse("Format data tidak valid.");
    }

    const validationError = validateQuestion(body);
    if (validationError) return errorResponse(validationError);

    const phenomenon = await prisma.phenomenon.findUnique({
      where: { id: body.phenomenonId },
      select: { id: true },
    });

    if (!phenomenon) return errorResponse("Fenomena tidak ditemukan.", 404);

    const question = await prisma.question.create({
      data: {
        phenomenonId: body.phenomenonId,
        text: body.text.trim(),
        explanation: body.explanation.trim(),
        difficulty: body.difficulty as (typeof DIFFICULTIES)[number],
        points: body.points,
        source: (body.source ?? "WEBSITE") as (typeof SOURCES)[number],
        isPublished: false,
        isArchived: false,
        options: {
          create: body.options.map((option, index) => ({
            text: option.text.trim(),
            isCorrect: option.isCorrect,
            sortOrder: index,
          })),
        },
      },
      include: {
        phenomenon: {
          include: { category: true },
        },
        options: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(
      { message: "Soal berhasil ditambahkan.", question },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/dashboard/questions:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan soal." },
      { status: 500 },
    );
  }
}