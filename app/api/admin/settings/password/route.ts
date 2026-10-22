// app/api/admin/settings/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getCurrentAdmin,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/admin-session";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Sesi admin tidak valid. Silakan login kembali." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";
    const confirmPassword =
      typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "Semua kolom wajib diisi." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Kata sandi baru minimal 8 karakter." },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Konfirmasi kata sandi baru tidak cocok." },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { message: "Kata sandi baru harus berbeda dari kata sandi saat ini." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: admin.id },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return NextResponse.json(
        { message: "Data kata sandi admin tidak ditemukan." },
        { status: 400 },
      );
    }

    const validPassword = await verifyPassword(
      currentPassword,
      user.passwordHash,
    );

    if (!validPassword) {
      return NextResponse.json(
        { message: "Kata sandi saat ini salah." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      message: "Kata sandi berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Admin change password error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengubah kata sandi." },
      { status: 500 },
    );
  }
}