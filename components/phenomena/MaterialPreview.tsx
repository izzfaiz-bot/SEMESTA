// components/phenomena/MaterialPreview.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Check, Presentation, Share2 } from "lucide-react";

const PdfSlideViewer = dynamic(() => import("./PdfSlideViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] flex-1 items-center justify-center bg-[#111c2c] text-sm text-slate-400">
      Menyiapkan penampil PDF...
    </div>
  ),
});

type Props = {
  slug: string;
  materialId: string;
  title: string;
  src: string;
};

export default function MaterialPreview({
  slug,
  materialId,
  title,
  src,
}: Props) {
  const previewRef = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [sharedOrCopied, setSharedOrCopied] = useState(false);

  // Diagnostik: memeriksa apakah komponen induk ikut dipasang ulang.
  useEffect(() => {
    console.log("[PREVIEW DEBUG] MaterialPreview dipasang", {
      materialId,
      src,
    });

    return () => {
      console.log("[PREVIEW DEBUG] MaterialPreview dilepas", {
        materialId,
        src,
      });
    };
  }, [materialId, src]);

  useEffect(() => {
    function handleFullscreenChange() {
      setFullscreen(document.fullscreenElement === previewRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!sharedOrCopied) return;

    const timer = window.setTimeout(() => {
      setSharedOrCopied(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [sharedOrCopied]);

  async function handleShareOrCopy() {
    const url = new URL(
      `/phenomena/${encodeURIComponent(slug)}/materi`,
      window.location.origin,
    );
    url.searchParams.set("material", materialId);

    const shareData = {
      title: title,
      text: `Materi pembelajaran SEMESTA: ${title}`,
      url: url.toString(),
    };

    try {
      // Jika browser/perangkat mendukung Web Share API (Mobile & beberapa Desktop modern)
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      // Fallback: Salin tautan ke clipboard jika Web Share API tidak tersedia
      await navigator.clipboard.writeText(url.toString());
      setSharedOrCopied(true);
    } catch (error) {
      // Abaikan jika user membatalkan dialog share (AbortError)
      if ((error as Error).name !== "AbortError") {
        console.error("[MaterialPreview] Gagal membagikan/menyalin tautan:", error);
      }
    }
  }

  return (
    <section
      ref={previewRef}
      className={`flex min-h-0 min-w-0 flex-col overflow-hidden border border-white/10 bg-[#0a1626] ${
        fullscreen
          ? "h-dvh w-screen rounded-none"
          : "h-full rounded-2xl shadow-xl shadow-black/20"
      }`}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0b192b] px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
            <Presentation size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white sm:text-base">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleShareOrCopy}
            title="Bagikan atau salin tautan materi"
            aria-label="Bagikan atau salin tautan materi"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
          >
            {sharedOrCopied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        <PdfSlideViewer src={src} />
      </div>
    </section>
  );
}