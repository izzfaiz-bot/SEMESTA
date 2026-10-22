
// app/api/phenomena/[slug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const phenomenon = await prisma.phenomenon.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        sortOrder: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!phenomenon) {
      return NextResponse.json(
        { error: "Materi tidak ditemukan atau belum dipublikasikan." },
        { status: 404 },
      );
    }

    return NextResponse.json(phenomenon, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/phenomena/[slug]]", error);

    return NextResponse.json(
      { error: "Gagal memuat materi. Silakan coba kembali." },
      { status: 500 },
    );
  }
}
