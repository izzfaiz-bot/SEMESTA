// app/api/admin/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminSession, hashPassword } from "@/lib/auth/admin-session";

export async function GET() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    return NextResponse.json({ needsSetup: !admin });
  } catch (error) {
    console.error("[ADMIN SETUP GET ERROR]", error);

    return NextResponse.json(
      { message: "Gagal memeriksa status admin." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body?.password === "string" ? body.password : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return NextResponse.json(
        { message: "Format email tidak valid." },
        { status: 400 },
      );
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 1024) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter dan maksimal 1024 byte." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    const admin = await prisma.$transaction(async (tx) => {
      const lockResult = await tx.$queryRaw<{ locked: boolean }[]>`
        SELECT pg_advisory_xact_lock(7823419) IS NULL AS locked
      `;

      const existingAdmin = await tx.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (existingAdmin) return null;

      return tx.user.create({
        data: {
          email,
          passwordHash,
          role: "ADMIN",
          isActive: true,
        },
        select: { id: true, email: true },
      });
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Admin sudah terdaftar. Silakan login." },
        { status: 409 },
      );
    }

    const session = await createAdminSession(admin.id);

    const response = NextResponse.json({
      message: "Admin pertama berhasil dibuat.",
      admin,
    });

    response.cookies.set("semesta_admin_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
    });

    return response;
  } catch (error) {
    console.error("[ADMIN SETUP POST ERROR]", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }

    return NextResponse.json(
      { message: "Pendaftaran admin gagal. Periksa log terminal." },
      { status: 500 },
    );
  }
}