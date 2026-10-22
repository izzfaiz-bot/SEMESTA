// app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth/admin-session";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("semesta_admin_session")?.value;

    if (token) {
      await prisma.adminSession.deleteMany({
        where: { tokenHash: hashToken(token) },
      });
    }

    const response = NextResponse.json({
      message: "Logout berhasil.",
    });

    response.cookies.set("semesta_admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat logout." },
      { status: 500 },
    );
  }
}