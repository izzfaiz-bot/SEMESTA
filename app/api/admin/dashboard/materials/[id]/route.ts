// app/api/admin/dashboard/materials/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/admin-session";
import type { MaterialType } from "@/modules/dashboard/learning-materials/types/learning.types";

type RouteContext = { params: Promise<{ id: string }> };

const MATERIAL_TYPES: MaterialType[] = ["VIDEO", "PPT"];

function isMaterialType(value: unknown): value is MaterialType {
  return typeof value === "string" && MATERIAL_TYPES.includes(value as MaterialType);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return errorResponse("Akses ditolak.", 401);

    const { id } = await params;
    if (!id?.trim()) return errorResponse("ID materi tidak valid.", 400);

    const material = await prisma.learningMaterial.findUnique({
      where: { id },
      include: {
        phenomenon: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: {
              select: { id: true, name: true, slug: true, emoji: true },
            },
          },
        },
      },
    });

    if (!material) return errorResponse("Materi tidak ditemukan.", 404);

    return NextResponse.json({ material });
  } catch (error) {
    console.error("GET /api/admin/dashboard/materials/[id]:", error);
    return errorResponse("Gagal mengambil detail materi.", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return errorResponse("Akses ditolak.", 401);

    const { id } = await params;
    if (!id?.trim()) return errorResponse("ID materi tidak valid.", 400);

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Format JSON tidak valid.", 400);
    }

    if (!isRecord(body)) {
      return errorResponse("Data materi harus berupa objek.", 400);
    }

    const current = await prisma.learningMaterial.findUnique({
      where: { id },
    });

    if (!current) return errorResponse("Materi tidak ditemukan.", 404);

    const phenomenonId =
      body.phenomenonId !== undefined
        ? typeof body.phenomenonId === "string"
          ? body.phenomenonId.trim()
          : ""
        : current.phenomenonId;

    const type = body.type !== undefined ? body.type : current.type;

    const title =
      body.title !== undefined
        ? typeof body.title === "string"
          ? body.title.trim()
          : ""
        : current.title;

    const description =
      body.description !== undefined
        ? typeof body.description === "string"
          ? body.description.trim()
          : body.description === null
            ? ""
            : null
        : current.description ?? "";

    const url =
      body.url !== undefined
        ? typeof body.url === "string"
          ? body.url.trim()
          : ""
        : current.url;

    const storagePath =
      body.storagePath !== undefined
        ? typeof body.storagePath === "string"
          ? body.storagePath.trim()
          : body.storagePath === null
            ? ""
            : null
        : current.storagePath ?? "";

    if (!phenomenonId || !title || !url) {
      return errorResponse("Fenomena, judul, dan URL wajib diisi.", 400);
    }

    if (!isMaterialType(type)) {
      return errorResponse("Tipe materi harus VIDEO atau PPT.", 400);
    }

    if (title.length > 180) {
      return errorResponse("Judul maksimal 180 karakter.", 400);
    }

    if (description === null || storagePath === null) {
      return errorResponse("Format deskripsi atau storagePath tidak valid.", 400);
    }

    if (description.length > 2000) {
      return errorResponse("Deskripsi maksimal 2000 karakter.", 400);
    }

    if (!isValidUrl(url)) {
      return errorResponse("URL materi tidak valid.", 400);
    }

    if (
      body.sortOrder !== undefined &&
      (!Number.isInteger(body.sortOrder) ||
        typeof body.sortOrder !== "number" ||
        body.sortOrder < 0)
    ) {
      return errorResponse("Urutan materi tidak valid.", 400);
    }

    const phenomenon = await prisma.phenomenon.findUnique({
      where: { id: phenomenonId },
      select: { id: true },
    });

    if (!phenomenon) {
      return errorResponse("Fenomena tidak ditemukan.", 400);
    }

    const material = await prisma.learningMaterial.update({
      where: { id },
      data: {
        phenomenonId,
        type,
        title,
        description: description || null,
        url,
        storagePath: storagePath || null,
        isPublished: true,
        ...(body.sortOrder !== undefined
          ? { sortOrder: body.sortOrder as number }
          : {}),
      },
      include: {
        phenomenon: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: {
              select: { id: true, name: true, slug: true, emoji: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Materi berhasil diperbarui dan dipublikasikan.",
      material,
    });
  } catch (error) {
    console.error("PATCH /api/admin/dashboard/materials/[id]:", error);
    return errorResponse("Gagal memperbarui materi.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return errorResponse("Akses ditolak.", 401);

    const { id } = await params;
    if (!id?.trim()) return errorResponse("ID materi tidak valid.", 400);

    const material = await prisma.learningMaterial.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!material) return errorResponse("Materi tidak ditemukan.", 404);

    await prisma.learningMaterial.delete({ where: { id } });

    return NextResponse.json({ message: "Materi berhasil dihapus." });
  } catch (error) {
    console.error("DELETE /api/admin/dashboard/materials/[id]:", error);
    return errorResponse("Gagal menghapus materi.", 500);
  }
}