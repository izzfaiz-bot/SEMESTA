// components/phenomena/VideoPlayer.tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Clapperboard,
  ListVideo,
  Play,
  PlayCircle,
  Presentation,
  Share2,
  Sparkles,
  VideoOff,
} from "lucide-react";

type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  url: string;
};

type VideoPlayerProps = {
  videos: VideoItem[];
};

type VideoSource =
  | { type: "youtube"; src: string; provider: string }
  | { type: "drive"; src: string; provider: string }
  | { type: "direct"; src: string; provider: string }
  | { type: "unsupported"; provider: string };

function getVideoSource(url: string): VideoSource {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol;

    if (protocol !== "https:" && protocol !== "http:") {
      return { type: "unsupported", provider: "" };
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    // YouTube
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com" ||
      host === "music.youtube.com"
    ) {
      let videoId = "";

      if (host === "youtu.be") {
        videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
      } else if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v") ?? "";
      } else {
        const match = parsed.pathname.match(
          /^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]+)/,
        );
        videoId = match?.[1] ?? "";
      }

      if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return {
          type: "youtube",
          src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
          provider: "YouTube",
        };
      }

      return { type: "unsupported", provider: "YouTube" };
    }

    // Google Drive: mendukung /file/d/ID/view, /preview, /open?id=ID,
    // serta /uc?id=ID.
    if (host === "drive.google.com") {
      const pathMatch = parsed.pathname.match(
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
      );

      const fileId =
        pathMatch?.[1] ||
        parsed.searchParams.get("id") ||
        "";

      if (/^[a-zA-Z0-9_-]{10,}$/.test(fileId)) {
        return {
          type: "drive",
          src: `https://drive.google.com/file/d/${fileId}/preview`,
          provider: "Google Drive",
        };
      }

      return { type: "unsupported", provider: "Google Drive" };
    }

    // Video langsung, misalnya MP4, WebM, OGG, OGV, atau M4V.
    if (/\.(mp4|webm|ogg|ogv|m4v)$/i.test(parsed.pathname)) {
      return {
        type: "direct",
        src: parsed.href,
        provider: "Video langsung",
      };
    }

    return { type: "unsupported", provider: "Sumber eksternal" };
  } catch {
    return { type: "unsupported", provider: "" };
  }
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);

  const [activeId, setActiveId] = useState(videos[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);

  const activeVideo =
    videos.find((video) => video.id === activeId) ?? videos[0];

  useEffect(() => {
    if (videos.length === 0) {
      setActiveId("");
      return;
    }

    if (!videos.some((video) => video.id === activeId)) {
      setActiveId(videos[0].id);
    }
  }, [videos, activeId]);

  useEffect(() => {
    if (!copied && !shareError) return;

    const timer = window.setTimeout(() => {
      setCopied(false);
      setShareError(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [copied, shareError]);

  async function handleShare() {
    if (!activeVideo) return;

    const url = new URL(window.location.href);
    url.searchParams.set("video", activeVideo.id);

    const shareData = {
      title: activeVideo.title,
      text: `Video pembelajaran SEMESTA: ${activeVideo.title}`,
      url: url.toString(),
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setShareError(false);
        return;
      }

      // Fallback jika Clipboard API tidak tersedia.
      const textArea = document.createElement("textarea");
      textArea.value = shareData.url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      textArea.style.pointerEvents = "none";

      document.body.appendChild(textArea);
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (!successful) throw new Error("Gagal menyalin tautan");

      setCopied(true);
      setShareError(false);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;

      console.error("[VideoPlayer] Gagal membagikan tautan:", error);
      setShareError(true);
      setCopied(false);
    }
  }

  const fadeUp = {
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" as const },
  };

  if (!activeVideo) {
    return (
      <motion.section
        {...fadeUp}
        className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a1626] px-5 text-center"
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/[0.08] blur-3xl" />

        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.08] text-cyan-300"
        >
          <PlayCircle size={34} strokeWidth={1.5} />
        </motion.div>

        <Sparkles size={16} className="mb-3 text-cyan-300/60" />

        <p className="font-semibold text-white">
          Belum ada video pembelajaran
        </p>

        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
          Materi video akan tersedia di sini setelah ditambahkan.
        </p>
      </motion.section>
    );
  }

  const source = getVideoSource(activeVideo.url);
  const playable = source.type !== "unsupported";

  return (
    <section className="relative isolate flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a1626] shadow-xl shadow-black/20">
      {/* Latar animasi */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 24, 0],
                  y: [0, -18, 0],
                  opacity: [0.08, 0.18, 0.08],
                }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]"
        />

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, -18, 0],
                  y: [0, 20, 0],
                  opacity: [0.05, 0.14, 0.05],
                }
          }
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[90px]"
        />
      </div>

      {/* Header: konsep sama dengan MaterialPreview */}
      <motion.header
        {...fadeUp}
        className="relative z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0b192b]/95 px-3 py-3 backdrop-blur-xl sm:px-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/15 to-blue-500/10 text-cyan-300 shadow-lg shadow-cyan-950/20"
          >
            <Presentation size={19} />
          </motion.div>

          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">
                SEMESTA
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span className="text-[10px] font-medium text-slate-500">
                Video pembelajaran
              </span>
            </div>

            <h2 className="truncate text-sm font-semibold tracking-wide text-white sm:text-base">
              {activeVideo.title}
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1.5 sm:flex">
            <motion.span
              animate={
                reduceMotion ? undefined : { opacity: [1, 0.45, 1] }
              }
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            />
            <span className="text-[10px] font-medium text-emerald-300">
              {playable ? "Siap dipelajari" : "Periksa tautan"}
            </span>
          </div>

          <motion.button
            type="button"
            onClick={handleShare}
            whileHover={reduceMotion ? undefined : { scale: 1.05, y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            title="Bagikan atau salin tautan video"
            aria-label="Bagikan atau salin tautan video"
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 transition-colors duration-200 ${
              copied
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : shareError
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/30 hover:bg-cyan-300/[0.08] hover:text-cyan-200"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
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
              ) : shareError ? (
                <motion.span
                  key="error"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs font-medium"
                >
                  Gagal menyalin
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

      {/* Garis cahaya */}
      <div className="relative h-px shrink-0 overflow-hidden bg-white/[0.03]">
        <motion.div
          animate={reduceMotion ? undefined : { x: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
        />
      </div>

      {/* Konten video dan daftar */}
      <div className="relative grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5">
        {/* Pemutar dan detail */}
        <motion.div
          {...fadeUp}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden"
        >
          <div className="group relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#030914] shadow-xl shadow-black/20">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-10 w-10 border-l border-t border-cyan-300/40" />
            <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-10 w-10 border-b border-r border-cyan-300/40" />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px overflow-hidden">
              <motion.div
                animate={reduceMotion ? undefined : { x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
              />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeVideo.id}
                initial={
                  reduceMotion ? false : { opacity: 0, scale: 0.985, y: 5 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative aspect-video max-h-full w-full"
              >
                {source.type === "direct" && (
                  <video
                    key={activeVideo.id}
                    src={source.src}
                    controls
                    playsInline
                    preload="metadata"
                    controlsList="nodownload noplaybackrate noremoteplayback"
                    disablePictureInPicture
                    className="absolute inset-0 h-full w-full bg-black object-contain"
                  >
                    Browser kamu tidak mendukung pemutaran video.
                  </video>
                )}

                {source.type === "youtube" && (
                  <iframe
                    key={activeVideo.id}
                    src={source.src}
                    title={activeVideo.title}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )}

                {source.type === "drive" && (
                  <iframe
                    key={activeVideo.id}
                    src={source.src}
                    title={activeVideo.title}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )}

                {source.type === "unsupported" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050c17] px-5 text-center">
                    <motion.div
                      animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.08] text-cyan-300"
                    >
                      <VideoOff size={28} />
                    </motion.div>

                    <p className="font-semibold text-white">
                      Video belum dapat diputar
                    </p>

                    <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
                      Format tautan belum didukung. Gunakan tautan YouTube,
                      Google Drive yang mengarah ke file, atau URL video
                      langsung.
                    </p>

                    {source.provider && (
                      <span className="mt-4 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] text-slate-500">
                        {source.provider}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Informasi video */}
          <motion.div
            key={`info-${activeVideo.id}`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="shrink-0 pt-3 sm:pt-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-cyan-300 sm:text-xs">
                <PlayCircle size={15} />
                MATERI PEMBELAJARAN
              </div>

              <span className="h-1 w-1 rounded-full bg-slate-600" />

              <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-xs">
                {playable ? (
                  <>
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {source.provider}
                  </>
                ) : (
                  <>
                    <VideoOff size={12} className="text-amber-400" />
                    Tidak tersedia
                  </>
                )}
              </span>
            </div>

            <h2 className="line-clamp-2 text-base font-bold leading-snug text-white sm:text-xl">
              {activeVideo.title}
            </h2>

            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
              {activeVideo.description ||
                "Belum ada deskripsi untuk video ini."}
            </p>
          </motion.div>
        </motion.div>

        {/* Daftar video */}
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.08 }}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b1220]/80 shadow-lg shadow-black/10 backdrop-blur-xl"
        >
          <div className="relative shrink-0 border-b border-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={
                  reduceMotion ? undefined : { rotate: -5, scale: 1.05 }
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/10 bg-gradient-to-br from-cyan-300/15 to-blue-500/10 text-cyan-300"
              >
                <ListVideo size={19} />
              </motion.div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Daftar video
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Pilih materi pembelajaran
                </p>
              </div>

              <span className="ml-auto rounded-lg border border-white/[0.06] bg-white/[0.05] px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-300">
                {String(videos.length).padStart(2, "0")}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2.5 [scrollbar-width:thin] sm:p-3">
            {videos.map((video, index) => {
              const isActive = video.id === activeVideo.id;
              const videoSource = getVideoSource(video.url);
              const videoPlayable = videoSource.type !== "unsupported";

              return (
                <motion.button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveId(video.id)}
                  aria-pressed={isActive}
                  whileHover={
                    reduceMotion ? undefined : { x: 2, scale: 1.005 }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  transition={{ duration: 0.18 }}
                  className={`relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-3 text-left transition-colors duration-200 ${
                    isActive
                      ? "border-cyan-400/30 bg-gradient-to-r from-cyan-400/[0.10] to-blue-500/[0.04] shadow-md shadow-cyan-950/20"
                      : "border-white/[0.05] bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.05]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="video-active-indicator"
                      className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-cyan-300"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}

                  <span
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "bg-cyan-300 text-slate-950 shadow-md shadow-cyan-950/30"
                        : "border border-white/[0.05] bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isActive ? (
                        <motion.span
                          key="active"
                          initial={
                            reduceMotion ? false : { opacity: 0, scale: 0.7 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                        >
                          <Play size={17} fill="currentColor" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="inactive"
                          initial={
                            reduceMotion ? false : { opacity: 0, scale: 0.8 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <PlayCircle size={20} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold tracking-[0.12em] ${
                          isActive ? "text-cyan-300" : "text-slate-500"
                        }`}
                      >
                        VIDEO {String(index + 1).padStart(2, "0")}
                      </span>

                      {isActive && (
                        <motion.span
                          initial={
                            reduceMotion ? false : { opacity: 0, scale: 0.8 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-full bg-cyan-300/10 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-200"
                        >
                          DIPILIH
                        </motion.span>
                      )}
                    </span>

                    <span
                      className={`block break-words text-sm font-medium leading-5 ${
                        isActive ? "text-cyan-100" : "text-slate-200"
                      }`}
                    >
                      {video.title}
                    </span>

                    <span className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          videoPlayable
                            ? "bg-emerald-400/80"
                            : "bg-amber-400/80"
                        }`}
                      />
                      {videoPlayable
                        ? videoSource.provider
                        : "Format tidak didukung"}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-white/[0.07] px-3 py-2.5">
            <Clapperboard size={14} className="text-cyan-300/70" />
            <span className="text-[10px] text-slate-500">
              SEMESTA · Media pembelajaran
            </span>
            <Sparkles size={13} className="ml-auto text-cyan-300/40" />
          </div>
        </motion.aside>
      </div>
    </section>
  );
}