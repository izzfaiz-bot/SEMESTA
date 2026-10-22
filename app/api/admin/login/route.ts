// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createAdminSession,
  verifyPassword,
} from "@/lib/auth/admin-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password =
      typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi." },
        { status: 400 },
      );
    }

    const admin = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (
      !admin ||
      admin.role !== "ADMIN" ||
      !admin.isActive ||
      !admin.passwordHash ||
      !(await verifyPassword(password, admin.passwordHash))
    ) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 },
      );
    }

    const session = await createAdminSession(admin.id);
    const response = NextResponse.json({
      message: "Login berhasil.",
      admin: { id: admin.id, email: admin.email },
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
    console.error("Admin login error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat login." },
      { status: 500 },
    );
  }
}