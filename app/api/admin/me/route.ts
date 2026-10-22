// app/api/admin/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/admin-session";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "Silakan login terlebih dahulu.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin session check error:", error);

    return NextResponse.json(
      { message: "Gagal memeriksa sesi admin." },
      { status: 500 },
    );
  }
}