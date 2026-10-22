// app/api/admin/dashboard/questions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/admin-session";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
const SOURCES = ["WEBSITE", "TEACHER"] as const;

type OptionInput = {
  id?: string;
  text: string;
  isCorrect: boolean;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function validateContent(body: {
  phenomenonId: string;
  text: string;
  explanation: string;
  difficulty: string;
  points: number;
  source: string;
  options: OptionInput[];
}) {
  if (!body.phenomenonId?.trim()) return "Fenomena wajib dipilih.";
  if (!body.text?.trim()) return "Pertanyaan wajib diisi.";
  if (body.text.trim().length > 10000) {
    return "Pertanyaan maksimal 10.000 karakter.";
  }
  if (!body.explanation?.trim()) return "Pembahasan wajib diisi.";
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
  if (!SOURCES.includes(body.source as (typeof SOURCES)[number])) {
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
    return "Semua pilihan jawaban wajib diisi.";
  }
  if (body.options.filter((option) => option.isCorrect).length !== 1) {
    return "Pilih tepat satu jawaban yang benar.";
  }

  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return errorResponse("Akses ditolak.", 401);

    const { id } = await params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        phenomenon: {
          include: { category: true },
        },
        options: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!question) return errorResponse("Soal tidak ditemukan.", 404);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("GET /api/admin/dashboard/questions/[id]:", error);
    return NextResponse.json(
      { message: "Gagal memuat detail soal." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return errorResponse("Akses ditolak.", 401);

    const { id } = await params;
    let body: Record<string, unknown>;

    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return errorResponse("Format data tidak valid.");
    }

    const existing = await prisma.question.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });

    if (!existing) return errorResponse("Soal tidak ditemukan.", 404);

    const statusKeys = ["isPublished", "isArchived"];
    const isStatusOnly =
      Object.keys(body).length > 0 &&
      Object.keys(body).every((key) => statusKeys.includes(key));

    if (isStatusOnly) {
      if (
        (body.isPublished !== undefined &&
          typeof body.isPublished !== "boolean") ||
        (body.isArchived !== undefined &&
          typeof body.isArchived !== "boolean")
      ) {
        return errorResponse("Status soal tidak valid.");
      }

      const publish = body.isPublished as boolean | undefined;
      const archive = body.isArchived as boolean | undefined;

      if (publish === true && archive === true) {
        return errorResponse("Soal tidak dapat dipublikasikan sekaligus diarsipkan.");
      }

      const updated = await prisma.question.update({
        where: { id },
        data: {
          ...(publish !== undefined && {
            isPublished: publish,
            ...(publish && { isArchived: false }),
          }),
          ...(archive !== undefined && {
            isArchived: archive,
            ...(archive && { isPublished: false }),
          }),
        },
        include: {
          phenomenon: { include: { category: true } },
          options: { orderBy: { sortOrder: "asc" } },
        },
      });

      return NextResponse.json({
        message: updated.isArchived
          ? "Soal berhasil diarsipkan."
          : updated.isPublished
            ? "Soal berhasil dipublikasikan."
            : "Status soal berhasil diperbarui.",
        question: updated,
      });
    }

    const phenomenonId =
      typeof body.phenomenonId === "string"
        ? body.phenomenonId
        : existing.phenomenonId;
    const text = typeof body.text === "string" ? body.text : existing.text;
    const explanation =
      typeof body.explanation === "string"
        ? body.explanation
        : existing.explanation;
    const difficulty =
      typeof body.difficulty === "string"
        ? body.difficulty
        : existing.difficulty;
    const points =
      typeof body.points === "number" ? body.points : existing.points;
    const source =
      typeof body.source === "string" ? body.source : existing.source;
    const options = Array.isArray(body.options)
      ? (body.options as OptionInput[])
      : existing.options.map((option) => ({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect,
        }));

    const validationError = validateContent({
      phenomenonId,
      text,
      explanation,
      difficulty,
      points,
      source,
      options,
    });

    if (validationError) return errorResponse(validationError);

    const phenomenon = await prisma.phenomenon.findUnique({
      where: { id: phenomenonId },
      select: { id: true },
    });

    if (!phenomenon) return errorResponse("Fenomena tidak ditemukan.", 404);

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(body.options)) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
      }

      return tx.question.update({
        where: { id },
        data: {
          phenomenonId,
          text: text.trim(),
          explanation: explanation.trim(),
          difficulty: difficulty as (typeof DIFFICULTIES)[number],
          points,
          source: source as (typeof SOURCES)[number],
          ...(Array.isArray(body.options) && {
            options: {
              create: options.map((option, index) => ({
                text: option.text.trim(),
                isCorrect: option.isCorrect,
                sortOrder: index,
              })),
            },
          }),
        },
        include: {
          phenomenon: { include: { category: true } },
          options: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json({
      message: "Soal berhasil diperbarui.",
      question: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/dashboard/questions/[id]:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui soal." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return errorResponse("Akses ditolak.", 401);

    const { id } = await params;
    const existing = await prisma.question.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) return errorResponse("Soal tidak ditemukan.", 404);

    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ message: "Soal berhasil dihapus." });
  } catch (error) {
    console.error("DELETE /api/admin/dashboard/questions/[id]:", error);
    return NextResponse.json(
      { message: "Gagal menghapus soal." },
      { status: 500 },
    );
  }
}