// app/api/admin/dashboard/phenomena/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentAdmin } from "@/lib/auth/admin-session";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak." },
        { status: 401 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { message: "Konfigurasi Supabase Storage belum lengkap." },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Pilih gambar terlebih dahulu." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Gunakan gambar JPG, PNG, atau WebP." },
        { status: 400 },
      );
    }

    if (file.size === 0 || file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "Ukuran gambar harus lebih dari 0 dan maksimal 5 MB." },
        { status: 400 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const extension = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }[file.type];

    const filePath = `phenomena/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("phenomena")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error.message);
      return NextResponse.json(
        { message: "Gagal mengunggah gambar ke Storage." },
        { status: 500 },
      );
    }

    const { data } = supabase.storage
      .from("phenomena")
      .getPublicUrl(filePath);

    return NextResponse.json({ imageUrl: data.publicUrl });
  } catch (error) {
    console.error("Phenomenon upload error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengunggah gambar." },
      { status: 500 },
    );
  }
}