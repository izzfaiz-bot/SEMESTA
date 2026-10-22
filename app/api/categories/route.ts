// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("[GET /api/categories]", error);

    const detail =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: "Gagal mengambil kategori.",
        detail,
      },
      { status: 500 },
    );
  }
}