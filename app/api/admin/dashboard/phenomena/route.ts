// app/api/admin/dashboard/phenomena/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/admin-session";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
    }

    const phenomena = await prisma.phenomenon.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }, { id: "asc" }],
      include: {
        category: {
          select: { id: true, name: true, slug: true, emoji: true },
        },
      },
    });

    return NextResponse.json({
      phenomena: phenomena.map((item) => ({ ...item, name: item.title })),
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard/phenomena:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data fenomena." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
    }

    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const slug = slugify(title);
    const categoryId = String(body.categoryId ?? "").trim();
    const description = String(body.description ?? "").trim();
    const imageUrl = String(body.imageUrl ?? "").trim();
    const content = String(body.content ?? "").trim();

    if (!title || !categoryId || !description || !imageUrl) {
      return NextResponse.json(
        { message: "Nama, kategori, deskripsi, dan gambar wajib diisi." },
        { status: 400 },
      );
    }

    if (title.length > 180 || description.length > 500) {
      return NextResponse.json(
        { message: "Nama maksimal 180 karakter dan deskripsi maksimal 500 karakter." },
        { status: 400 },
      );
    }

    if (!slug) {
      return NextResponse.json(
        { message: "Nama fenomena harus memiliki huruf atau angka." },
        { status: 400 },
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan." },
        { status: 400 },
      );
    }

    const phenomenon = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.phenomenon.findUnique({
          where: { slug },
          select: { id: true },
        });

        if (existing) {
          throw new Error("SLUG_DUPLICATE");
        }

        const last = await tx.phenomenon.aggregate({
          _max: { sortOrder: true },
        });

        const sortOrder = Math.max(0, last._max.sortOrder ?? -1) + 1;

        return tx.phenomenon.create({
          data: {
            title,
            slug,
            categoryId,
            description,
            content: content || null,
            imageUrl,
            sortOrder,
            isPublished: true,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true, emoji: true },
            },
          },
        });
      },
      { isolationLevel: "Serializable" },
    );

    return NextResponse.json(
      { message: "Fenomena berhasil ditambahkan.", phenomenon },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_DUPLICATE") {
      return NextResponse.json(
        { message: "Nama fenomena menghasilkan slug yang sudah digunakan." },
        { status: 409 },
      );
    }

    console.error("POST /api/admin/dashboard/phenomena:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan fenomena." },
      { status: 500 },
    );
  }
}