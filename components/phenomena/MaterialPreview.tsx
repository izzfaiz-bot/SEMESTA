// components/phenomena/MaterialPreview.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Presentation, Share2, Sparkles } from "lucide-react";

const PdfSlideViewer = dynamic(() => import("./PdfSlideViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-4 bg-[#0a1626] text-sm text-slate-400 sm:min-h-[320px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.08]"
      >
        <Presentation size={22} className="text-cyan-300" />
      </motion.div>

      <div className="flex flex-col items-center gap-2">
        <span className="font-medium text-slate-300">
          Menyiapkan penampil PDF
        </span>
        <div className="h-1 w-36 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            animate={{ x: ["-100%", "150%"] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ width: "65%" }}
          />
        </div>
      </div>
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
  const prefersReducedMotion = useReducedMotion();

  // Memantau perubahan fullscreen browser.
  useEffect(() => {
    function handleFullscreenChange() {
      setFullscreen(document.fullscreenElement === previewRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  // Menghilangkan notifikasi salin tautan secara otomatis.
  useEffect(() => {
    if (!sharedOrCopied) return;

    const timer = window.setTimeout(() => {
      setSharedOrCopied(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [sharedOrCopied]);

  async function handleShareOrCopy() {
    const url = new URL(
      `/phenomena/${encodeURIComponent(slug)}/materi`,
      window.location.origin,
    );

    url.searchParams.set("material", materialId);

    const shareData = {
      title,
      text: `Materi pembelajaran SEMESTA: ${title}`,
      url: url.toString(),
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(url.toString());
      setSharedOrCopied(true);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error(
          "[MaterialPreview] Gagal membagikan/menyalin tautan:",
          error,
        );
      }
    }
  }

  const fadeIn = prefersReducedMotion
    ? { initial: false as const, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <motion.section
      ref={previewRef}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative isolate flex min-h-0 min-w-0 flex-col overflow-hidden border border-white/[0.09] bg-[#0a1626] ${
        fullscreen
          ? "h-dvh w-screen rounded-none"
          : "h-full rounded-2xl shadow-xl shadow-black/20"
      }`}
    >
      {/* Dekorasi cahaya latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 24, 0],
                  y: [0, -18, 0],
                  opacity: [0.12, 0.22, 0.12],
                }
          }
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]"
        />

        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, -18, 0],
                  y: [0, 20, 0],
                  opacity: [0.06, 0.15, 0.06],
                }
          }
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[90px]"
        />
      </div>

      {/* Header */}
      <motion.header
        {...fadeIn}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="relative flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0b192b]/95 px-3 py-3 backdrop-blur-xl sm:px-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { rotate: -6, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/15 to-blue-500/10 text-cyan-300 shadow-lg shadow-cyan-950/20"
          >
            <motion.div
              aria-hidden="true"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { y: ["-150%", "150%"] }
              }
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-cyan-200/15 to-transparent"
            />

            <Presentation size={19} />
          </motion.div>

          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">
                SEMESTA
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span className="text-[10px] font-medium text-slate-500">
                Materi pembelajaran
              </span>
            </div>

            <h2 className="truncate text-sm font-semibold tracking-wide text-white sm:text-base">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Status materi */}
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1.5 sm:flex">
            <motion.span
              animate={
                prefersReducedMotion
                  ? undefined
                  : { opacity: [1, 0.45, 1], scale: [1, 0.85, 1] }
              }
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            />
            <span className="text-[10px] font-medium text-emerald-300">
              Siap dipelajari
            </span>
          </div>

          {/* Tombol bagikan */}
          <motion.button
            type="button"
            onClick={handleShareOrCopy}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { scale: 1.05, y: -1 }
            }
            whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
            title="Bagikan atau salin tautan materi"
            aria-label="Bagikan atau salin tautan materi"
            className={`relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 transition-colors duration-200 ${
              sharedOrCopied
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/30 hover:bg-cyan-300/[0.08] hover:text-cyan-200"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {sharedOrCopied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} />
                  <span className="text-xs font-medium">Tersalin</span>
                </motion.span>
              ) : (
                <motion.span
                  key="share"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2"
                >
                  <Share2 size={16} />
                  <span className="hidden text-xs font-medium sm:inline">
                    Bagikan
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Garis cahaya di bawah header */}
      <div
        aria-hidden="true"
        className="relative h-px shrink-0 overflow-hidden bg-white/[0.03]"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { x: ["-100%", "200%"] }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
        />
      </div>

      {/* Area PDF */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative flex min-h-0 min-w-0 flex-1"
      >
        <PdfSlideViewer src={src} />
      </motion.div>

      {/* Aksen sudut */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-px w-1/3 bg-gradient-to-r from-cyan-400/40 to-transparent"
      />

      <motion.div
        aria-hidden="true"
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [0.25, 0.7, 0.25] }
        }
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-3 right-3 text-cyan-300/30"
      >
        <Sparkles size={14} />
      </motion.div>
    </motion.section>
  );
}