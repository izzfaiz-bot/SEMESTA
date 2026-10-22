// app/api/admin/dashboard/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/admin-session";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        emoji: true,
        sortOrder: true,
        isPublished: true,
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/admin/categories:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data kategori.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}