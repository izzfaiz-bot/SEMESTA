// app/api/admin/dashboard/phenomena/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/admin-session";

type RouteContext = { params: Promise<{ id: string }> };

const STORAGE_BUCKET = "phenomena";

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

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Konfigurasi Supabase Storage belum lengkap.");
  }

  return createClient(url, serviceKey);
}

function getStoragePath(imageUrl: string): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !imageUrl) return null;

  try {
    const image = new URL(imageUrl);
    const project = new URL(supabaseUrl);

    if (image.origin !== project.origin) return null;

    const prefix = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    if (!image.pathname.startsWith(prefix)) return null;

    const path = image.pathname.slice(prefix.length);

    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}

async function deleteStorageImage(imageUrl: string | null | undefined) {
  if (!imageUrl) return;

  const path = getStoragePath(imageUrl);

  // Jangan menghapus URL yang bukan berasal dari bucket milik aplikasi.
  if (!path) {
    console.warn("Penghapusan gambar dilewati: URL bukan dari bucket fenomena.");
    return;
  }

  const supabase = getStorageClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    console.error("Gagal menghapus gambar dari Supabase Storage:", error.message);
    throw new Error("Gambar lama gagal dihapus dari Supabase Storage.");
  }
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
    }

    const { id } = await params;
    const phenomenon = await prisma.phenomenon.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true, emoji: true },
        },
      },
    });

    if (!phenomenon) {
      return NextResponse.json(
        { message: "Fenomena tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      phenomenon: { ...phenomenon, name: phenomenon.title },
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard/phenomena/[id]:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data fenomena." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const current = await prisma.phenomenon.findUnique({ where: { id } });

    if (!current) {
      return NextResponse.json(
        { message: "Fenomena tidak ditemukan." },
        { status: 404 },
      );
    }

    const title =
      body.title !== undefined ? String(body.title).trim() : current.title;
    const slug = slugify(title);
    const categoryId =
      body.categoryId !== undefined
        ? String(body.categoryId).trim()
        : current.categoryId;
    const description =
      body.description !== undefined
        ? String(body.description).trim()
        : (current.description ?? "").trim();
    const imageUrl =
      body.imageUrl !== undefined
        ? String(body.imageUrl ?? "").trim()
        : (current.imageUrl ?? "").trim();
    const content =
      body.content !== undefined
        ? String(body.content ?? "").trim()
        : current.content;

    if (!title || !categoryId || !description || !imageUrl) {
      return NextResponse.json(
        { message: "Nama, kategori, deskripsi, dan gambar wajib diisi." },
        { status: 400 },
      );
    }

    if (title.length > 180 || description.length > 500) {
      return NextResponse.json(
        {
          message:
            "Nama maksimal 180 karakter dan deskripsi maksimal 500 karakter.",
        },
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

    const duplicate = await prisma.phenomenon.findFirst({
      where: { slug, NOT: { id } },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "Nama fenomena menghasilkan slug yang sudah digunakan." },
        { status: 409 },
      );
    }

    const phenomenon = await prisma.phenomenon.update({
      where: { id },
      data: {
        title,
        slug,
        categoryId,
        description,
        content: content || null,
        imageUrl,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, emoji: true },
        },
      },
    });

    // Hapus gambar lama hanya jika URL berubah dan data baru sudah tersimpan.
    if (current.imageUrl && current.imageUrl !== imageUrl) {
      try {
        await deleteStorageImage(current.imageUrl);
      } catch (error) {
        console.error("Pembersihan gambar lama gagal:", error);

        return NextResponse.json({
          message:
            "Fenomena berhasil diperbarui, tetapi gambar lama gagal dihapus dari Storage.",
          phenomenon,
          cleanupWarning: true,
        });
      }
    }

    return NextResponse.json({
      message: "Fenomena berhasil diperbarui.",
      phenomenon,
    });
  } catch (error) {
    console.error("PATCH /api/admin/dashboard/phenomena/[id]:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui fenomena." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
    }

    const { id } = await params;

    // Ambil URL gambar sebelum menghapus data fenomena.
    const current = await prisma.phenomenon.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });

    if (!current) {
      return NextResponse.json(
        { message: "Fenomena tidak ditemukan." },
        { status: 404 },
      );
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.phenomenon.delete({ where: { id } });

        const remaining = await tx.phenomenon.findMany({
          orderBy: [{ sortOrder: "asc" }, { title: "asc" }, { id: "asc" }],
          select: { id: true, sortOrder: true },
        });

        if (remaining.length === 0) return;

        const maxOrder = Math.max(...remaining.map((item) => item.sortOrder));
        const temporaryStart = maxOrder + remaining.length + 1;

        // Pindahkan urutan ke nilai sementara agar tidak bentrok.
        for (let index = 0; index < remaining.length; index++) {
          await tx.phenomenon.update({
            where: { id: remaining[index].id },
            data: { sortOrder: temporaryStart + index },
          });
        }

        // Susun ulang menjadi 0, 1, 2, dan seterusnya.
        for (let index = 0; index < remaining.length; index++) {
          await tx.phenomenon.update({
            where: { id: remaining[index].id },
            data: { sortOrder: index },
          });
        }
      },
      { isolationLevel: "Serializable" },
    );

    // Database berhasil dihapus; lanjutkan menghapus file gambar.
    try {
      await deleteStorageImage(current.imageUrl);
    } catch (error) {
      console.error("Pembersihan gambar fenomena gagal:", error);

      return NextResponse.json({
        message:
          "Fenomena berhasil dihapus, tetapi gambar gagal dihapus dari Storage.",
        cleanupWarning: true,
      });
    }

    return NextResponse.json({
      message: "Fenomena dan gambar berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/dashboard/phenomena/[id]:", error);

    return NextResponse.json(
      {
        message:
          "Gagal menghapus fenomena. Periksa apakah data masih digunakan oleh materi atau soal lain.",
      },
      { status: 500 },
    );
  }
}