// app/api/admin/dashboard/materials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/admin-session";
import type { MaterialType } from "@/modules/dashboard/learning-materials/types/learning.types";

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

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const search = params.get("search")?.trim() ?? "";
    const categoryId = params.get("categoryId");
    const phenomenonId = params.get("phenomenonId");
    const type = params.get("type");
    const status = params.get("status");
    const page = Math.max(1, Number(params.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize")) || 10));

    if (type && type !== "ALL" && !isMaterialType(type)) {
      return NextResponse.json({ message: "Tipe materi tidak valid." }, { status: 400 });
    }

    if (status && !["ALL", "PUBLISHED", "DRAFT"].includes(status)) {
      return NextResponse.json({ message: "Filter status tidak valid." }, { status: 400 });
    }

    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { phenomenon: { title: { contains: search, mode: "insensitive" as const } } },
              { phenomenon: { category: { name: { contains: search, mode: "insensitive" as const } } } },
            ],
          }
        : {}),
      ...(categoryId && categoryId !== "ALL" ? { phenomenon: { categoryId } } : {}),
      ...(phenomenonId && phenomenonId !== "ALL" ? { phenomenonId } : {}),
      ...(type && type !== "ALL" ? { type: type as MaterialType } : {}),
      ...(status === "PUBLISHED" ? { isPublished: true } : {}),
      ...(status === "DRAFT" ? { isPublished: false } : {}),
    };

    const [materials, total, totalAll, video, ppt, published] = await prisma.$transaction([
      prisma.learningMaterial.findMany({
        where,
        include: {
          phenomenon: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: { select: { id: true, name: true, slug: true, emoji: true } },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.learningMaterial.count({ where }),
      prisma.learningMaterial.count(),
      prisma.learningMaterial.count({ where: { type: "VIDEO" } }),
      prisma.learningMaterial.count({ where: { type: "PPT" } }),
      prisma.learningMaterial.count({ where: { isPublished: true } }),
    ]);

    return NextResponse.json({
      materials,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      stats: { total: totalAll, video, ppt, published, draft: totalAll - published },
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard/materials:", error);
    return NextResponse.json({ message: "Gagal mengambil data materi." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });

    const body = await request.json();
    const phenomenonId = String(body.phenomenonId ?? "").trim();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const url = String(body.url ?? "").trim();
    const storagePath = String(body.storagePath ?? "").trim();
    const type = body.type;

    if (!phenomenonId || !title || !url || !type) {
      return NextResponse.json({ message: "Fenomena, tipe, judul, dan URL wajib diisi." }, { status: 400 });
    }

    if (!isMaterialType(type)) {
      return NextResponse.json({ message: "Tipe materi harus VIDEO atau PPT." }, { status: 400 });
    }

    if (title.length > 180) {
      return NextResponse.json({ message: "Judul maksimal 180 karakter." }, { status: 400 });
    }

    if (!isValidUrl(url)) {
      return NextResponse.json({ message: "URL materi tidak valid." }, { status: 400 });
    }

    const phenomenon = await prisma.phenomenon.findUnique({
      where: { id: phenomenonId },
      select: { id: true },
    });

    if (!phenomenon) {
      return NextResponse.json({ message: "Fenomena tidak ditemukan." }, { status: 400 });
    }

    const last = await prisma.learningMaterial.aggregate({
      where: { phenomenonId, type },
      _max: { sortOrder: true },
    });

    const material = await prisma.learningMaterial.create({
      data: {
        phenomenonId,
        type,
        title,
        description: description || null,
        url,
        storagePath: storagePath || null,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
        isPublished: body.isPublished === true,
      },
      include: {
        phenomenon: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: { select: { id: true, name: true, slug: true, emoji: true } },
          },
        },
      },
    });

    return NextResponse.json({ message: "Materi berhasil ditambahkan.", material }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/dashboard/materials:", error);
    return NextResponse.json({ message: "Gagal menambahkan materi." }, { status: 500 });
  }
}