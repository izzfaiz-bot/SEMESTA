// app/api/admin/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/admin-session";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Sesi admin tidak valid. Silakan login kembali." },
        { status: 401 },
      );
    }

    const [
      categories,
      phenomena,
      materials,
      publishedMaterials,
      questions,
      publishedQuestions,
      totalAttempts,
      completedAttempts,
      ongoingAttempts,
    ] = await Promise.all([
      prisma.category.count(),
      prisma.phenomenon.count(),
      prisma.learningMaterial.count(),
      prisma.learningMaterial.count({
        where: { isPublished: true },
      }),
      prisma.question.count({
        where: { isArchived: false },
      }),
      prisma.question.count({
        where: {
          isPublished: true,
          isArchived: false,
        },
      }),
      prisma.quizAttempt.count(),
      prisma.quizAttempt.count({
        where: { status: "COMPLETED" },
      }),
      prisma.quizAttempt.count({
        where: { status: "IN_PROGRESS" },
      }),
    ]);

    return NextResponse.json({
      totalCategories: categories,
      totalPhenomena: phenomena,
      totalMaterials: materials,
      totalQuestions: questions,
      publishedMaterials,
      unpublishedMaterials: materials - publishedMaterials,
      publishedQuestions,
      unpublishedQuestions: questions - publishedQuestions,
      totalAttempts,
      completedAttempts,
      ongoingAttempts,
    });
  } catch (error) {
    console.error("[ADMIN DASHBOARD STATS ERROR]", error);

    return NextResponse.json(
      { message: "Gagal mengambil statistik dashboard." },
      { status: 500 },
    );
  }
}