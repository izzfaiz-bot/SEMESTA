
// app/api/materials/[id]/pdf/route.ts
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PdfResult = {
  buffer: ArrayBuffer;
  sourceUrl: string;
};

async function fetchPdf(url: string): Promise<PdfResult | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      console.error("[PDF proxy] Sumber gagal:", response.status, url);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const signature = new TextDecoder().decode(
      new Uint8Array(buffer).slice(0, 5),
    );

    if (signature !== "%PDF-") {
      console.error("[PDF proxy] Respons bukan PDF:", {
        url,
        status: response.status,
        contentType: response.headers.get("content-type"),
        preview: new TextDecoder().decode(
          new Uint8Array(buffer).slice(0, 160),
        ),
      });
      return null;
    }

    return { buffer, sourceUrl: url };
  } catch (error) {
    console.error("[PDF proxy] Fetch gagal:", error);
    return null;
  }
}

function createHeaders(length: number, sourceUrl: string) {
  return new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'inline; filename="materi-semesta.pdf"',
    "Content-Length": String(length),
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store, no-transform",
    "X-Content-Type-Options": "nosniff",
    "X-PDF-Source": sourceUrl.includes("docs.google.com")
      ? "google-slides"
      : "google-drive",
  });
}

function parseRange(
  rangeHeader: string,
  size: number,
): { start: number; end: number } | null | "invalid" {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());

  if (!match || (!match[1] && !match[2])) return "invalid";

  let start: number;
  let end: number;

  if (!match[1]) {
    const suffixLength = Number(match[2]);

    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return "invalid";
    }

    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;

    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 0 ||
      end < start
    ) {
      return "invalid";
    }

    end = Math.min(end, size - 1);
  }

  if (size === 0 || start >= size) return null;

  return { start, end };
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json(
        { error: "ID Google Drive tidak valid." },
        { status: 400 },
      );
    }

    const urls = [
      `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`,
      `https://docs.google.com/presentation/d/${encodeURIComponent(id)}/export/pdf`,
    ];

    let pdf: PdfResult | null = null;

    for (const url of urls) {
      pdf = await fetchPdf(url);
      if (pdf) break;
    }

    if (!pdf) {
      return NextResponse.json(
        {
          error:
            "Google Drive tidak mengembalikan PDF valid. Periksa izin akses file dan pastikan file berupa PDF atau Google Slides yang dapat diekspor.",
        },
        {
          status: 502,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const bytes = new Uint8Array(pdf.buffer);
    const size = bytes.byteLength;
    const rangeHeader = request.headers.get("range");

    console.log("[PDF proxy] Permintaan:", {
      id,
      size,
      range: rangeHeader,
    });

    if (rangeHeader) {
      const range = parseRange(rangeHeader, size);

      if (range === null) {
        return new Response(null, {
          status: 416,
          headers: {
            "Accept-Ranges": "bytes",
            "Content-Range": `bytes */${size}`,
            "Cache-Control": "private, no-store",
          },
        });
      }

      if (range !== "invalid") {
        const { start, end } = range;
        const chunk = bytes.slice(start, end + 1);
        const headers = createHeaders(chunk.byteLength, pdf.sourceUrl);

        headers.set("Content-Range", `bytes ${start}-${end}/${size}`);

        return new Response(chunk, {
          status: 206,
          headers,
        });
      }

      console.warn("[PDF proxy] Range tidak valid; mengirim PDF utuh.");
    }

    return new Response(bytes, {
      status: 200,
      headers: createHeaders(size, pdf.sourceUrl),
    });
  } catch (error) {
    console.error("[PDF proxy] Kesalahan endpoint:", error);

    return NextResponse.json(
      { error: "Gagal mengambil PDF dari Google Drive." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
