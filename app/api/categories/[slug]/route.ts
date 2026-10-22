// app/api/categories/[slug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        subtitle: true,
        description: true,
        topics: true,
        emoji: true,
        sortOrder: true,
        phenomena: {
          where: { isPublished: true },
          orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            imageUrl: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[GET /api/categories/[slug]]", error);

    return NextResponse.json(
      { error: "Gagal memuat kategori." },
      { status: 500 },
    );
  }
}