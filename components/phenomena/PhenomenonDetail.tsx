// components/phenomena/PhenomenonDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  FileText,
  GraduationCap,
  Maximize,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Phenomenon } from "@/modules/phenomena/types/phenomena.types";

type Props = {
  slug: string;
};

const mediaOptions = [
  {
    type: "video",
    title: "Video Pembelajaran",
    subtitle: "Belajar lewat video yang menarik.",
    label: "WATCH",
    icon: CirclePlay,
    accent: "#8be8ff",
    background: "linear-gradient(110deg,#103f68,#142b50)",
    href: (slug: string) => `/phenomena/${slug}/video`,
  },
  {
    type: "ppt",
    title: "Materi Presentasi",
    subtitle: "Pahami konsep melalui slide.",
    label: "EXPLORE",
    icon: FileText,
    accent: "#dfc2ff",
    background: "linear-gradient(110deg,#40316f,#211d4d)",
    href: (slug: string) => `/phenomena/${slug}/materi`,
  },
  {
    type: "quiz",
    title: "Kuis Interaktif",
    subtitle: "Uji pemahamanmu tentang sains.",
    label: "CHALLENGE",
    icon: GraduationCap,
    accent: "#81ffe1",
    background: "linear-gradient(110deg,#126254,#123c4b)",
    href: (slug: string) => `/phenomena/${slug}/quiz`,
  },
];

const phenomenonEmojis: Record<string, string> = {
  pelangi: "🌈",
  "gerhana-bulan": "🌕",
  "gerhana-matahari": "🌑",
  "siklus-air": "💧",
  petir: "⚡",
  "gunung-meletus": "🌋",
  default: "🔭",
};

const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.09,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function PhenomenonDetail({ slug }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [phenomenon, setPhenomenon] = useState<Phenomenon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPhenomenon() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/phenomena/${encodeURIComponent(slug)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Materi tidak ditemukan atau belum tersedia."
              : "Materi gagal dimuat. Coba kembali.",
          );
        }

        const data = (await response.json()) as Phenomenon;
        setPhenomenon(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPhenomenon();

    return () => controller.abort();
  }, [slug]);

  // Deteksi fullscreen, termasuk perkiraan mode F11.
  useEffect(() => {
    let resizeFrame = 0;

    const syncFullscreen = () => {
      cancelAnimationFrame(resizeFrame);

      resizeFrame = requestAnimationFrame(() => {
        const apiFullscreen = Boolean(document.fullscreenElement);

        const heightDifference = Math.abs(
          window.outerHeight - window.screen.availHeight,
        );

        const widthDifference = Math.abs(
          window.outerWidth - window.screen.availWidth,
        );

        const browserFullscreen =
          heightDifference <= 3 ||
          (window.outerHeight >= window.screen.height - 3 &&
            window.innerHeight >= window.screen.height - 3) ||
          (widthDifference <= 3 &&
            window.outerWidth >= window.screen.width - 3);

        setIsFullscreen(apiFullscreen || browserFullscreen);
      });
    };

    syncFullscreen();

    document.addEventListener("fullscreenchange", syncFullscreen);
    window.addEventListener("resize", syncFullscreen);
    window.addEventListener("orientationchange", syncFullscreen);
    window.addEventListener("focus", syncFullscreen);

    return () => {
      cancelAnimationFrame(resizeFrame);
      document.removeEventListener("fullscreenchange", syncFullscreen);
      window.removeEventListener("resize", syncFullscreen);
      window.removeEventListener("orientationchange", syncFullscreen);
      window.removeEventListener("focus", syncFullscreen);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();

        // Perbaikan TypeScript untuk ScreenOrientation.lock().
        try {
          const orientation = screen.orientation as unknown as {
            lock?: (
              orientation: "landscape",
            ) => Promise<void>;
          };

          if (typeof orientation.lock === "function") {
            await orientation.lock("landscape");
          }
        } catch {
          // Penguncian orientasi tidak didukung di semua browser.
        }
      }
    } catch {
      // Browser mungkin tidak mendukung mode layar penuh.
    }
  };

  const emoji = phenomenonEmojis[slug] ?? phenomenonEmojis.default;

  const enterAnimation = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
        variants: contentVariants,
      };

  return (
    <main className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#08152f] font-sans text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-[100px] sm:h-96 sm:w-96"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 35, 0],
                  y: [0, 25, 0],
                  scale: [1, 1.12, 1],
                }
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-violet-500/15 blur-[100px] sm:h-96 sm:w-96"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, -30, 0],
                  y: [0, -25, 0],
                  scale: [1.1, 0.95, 1.1],
                }
          }
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(57,125,214,.16),transparent_45%),radial-gradient(ellipse_at_85%_75%,rgba(133,87,230,.14),transparent_45%)]" />

        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:35px_35px]" />

        {/* Bintang berkelip */}
        {!reduceMotion &&
          Array.from({ length: 16 }, (_, index) => (
            <motion.span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-cyan-100"
              style={{
                left: `${(index * 37 + 11) % 100}%`,
                top: `${(index * 23 + 7) % 100}%`,
              }}
              animate={{
                opacity: [0.15, 0.8, 0.15],
                scale: [0.7, 1.35, 0.7],
                y: [0, -8, 0],
              }}
              transition={{
                duration: 2.5 + (index % 4),
                delay: (index % 6) * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex h-[62px] shrink-0 items-center justify-between border-b border-white/10 px-4 sm:h-[70px] sm:px-8 lg:px-12">
        <motion.button
          type="button"
          onClick={() => router.push("/categories")}
          aria-label="Kembali ke kategori"
          whileHover={reduceMotion ? undefined : { scale: 1.06, x: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.06] transition-colors hover:border-cyan-200/30 hover:bg-cyan-200/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>

        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Halaman utama SEMESTA"
          className="flex items-center gap-2.5"
        />

        {!isFullscreen ? (
          <motion.button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Masuk layar penuh"
            title="Masuk layar penuh"
            whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: 4 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.06] transition-colors hover:border-cyan-200/30 hover:bg-cyan-200/10"
          >
            <Maximize className="h-5 w-5" />
          </motion.button>
        ) : (
          <div className="h-10 w-10 shrink-0 sm:w-auto sm:px-3" />
        )}
      </header>

      {/* Konten dibatasi oleh tinggi layar */}
      <div className="relative z-10 mx-auto flex h-0 min-h-0 w-full max-w-6xl flex-1 flex-col gap-2 overflow-hidden px-4 py-2 sm:gap-3 sm:px-6 sm:py-2.5 lg:px-8">
        {loading ? (
          <motion.div
            className="flex min-h-0 flex-1 flex-col items-center justify-center"
            role="status"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="mb-4 h-10 w-10 rounded-full border-4 border-white/10 border-t-cyan-200"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <p className="text-sm font-bold">Menyiapkan materi...</p>
            <p className="mt-1 text-xs text-white/45">
              Petualangan sainsmu segera dimulai.
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            className="flex min-h-0 flex-1 flex-col items-center justify-center text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BookOpen className="mb-3 h-10 w-10 text-cyan-200" />
            <h1 className="text-xl font-black">Materi belum tersedia</h1>
            <p className="mt-2 max-w-sm text-sm text-white/60">{error}</p>

            <motion.button
              type="button"
              onClick={() => router.push("/categories")}
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-cyan-100"
            >
              Kembali ke Kategori
            </motion.button>
          </motion.div>
        ) : phenomenon ? (
          <>
            {/* Intro materi */}
            <motion.section
              {...enterAnimation}
              className="flex shrink-0 flex-col items-center text-center"
            >
              <motion.div
                variants={itemVariants}
                className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-200/20 bg-cyan-200/[.07] px-3 py-1.5 text-[9px] font-extrabold tracking-[.18em] text-cyan-100 sm:mb-3 sm:text-[10px]"
              >
                <motion.span
                  animate={
                    reduceMotion ? undefined : { rotate: [0, 12, -12, 0] }
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.span>
                MATERI {String(phenomenon.sortOrder).padStart(2, "0")}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="relative mb-2 grid h-[58px] w-[58px] shrink-0 place-items-center overflow-hidden rounded-[19px] border border-white/10 bg-white/[.06] text-4xl shadow-lg shadow-cyan-950/20 sm:mb-3 sm:h-[70px] sm:w-[70px] sm:rounded-[22px] sm:text-5xl"
              >
                {!reduceMotion && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-[inherit] border border-cyan-200/30"
                    animate={{
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.06, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {phenomenon.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={phenomenon.imageUrl}
                    alt={phenomenon.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <motion.span
                    className="relative"
                    animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {emoji}
                  </motion.span>
                )}
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="max-w-full text-2xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl"
              >
                Jelajahi{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                  {phenomenon.title}
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="line-clamp-2 max-w-xl text-xs leading-5 text-white/60 sm:text-sm sm:leading-6"
              >
                {phenomenon.description ||
                  "Temukan hal menarik dan pelajari konsep di balik fenomena sains ini."}
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-white/50 sm:mt-3 sm:text-xs"
              >
                <BookOpen className="h-3.5 w-3.5 text-cyan-200" />
                3 media pembelajaran
                <span className="text-white/20">•</span>
                Belajar sesuai waktumu
              </motion.div>
            </motion.section>

            {/* Media section */}
            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : 0.2,
              }}
              className="flex min-h-0 flex-1 flex-col justify-center"
            >
              <div className="mb-2 flex shrink-0 items-end justify-between gap-2 sm:mb-3">
                <div>
                  <h2 className="mt-1 text-base font-black sm:text-xl">
                    Mulai Petualanganmu
                  </h2>
                </div>

                <span className="pb-0.5 text-[9px] text-white/35 sm:text-xs">
                  Pilih media belajar
                </span>
              </div>

              <div className="grid min-h-0 w-full flex-none grid-rows-3 gap-2 overflow-hidden md:grid-cols-3 md:grid-rows-1 md:gap-3 md:self-center md:w-full md:max-w-6xl">
                {mediaOptions.map((option, index) => {
                  const Icon = option.icon;

                  return (
                    <motion.button
                      key={option.type}
                      type="button"
                      onClick={() => router.push(option.href(slug))}
                      aria-label={`Buka ${option.title}`}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: 22, scale: 0.97 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: reduceMotion ? 0 : 0.25 + index * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : {
                              y: -5,
                              scale: 1.015,
                              transition: { duration: 0.2 },
                            }
                      }
                      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                      className="group relative flex h-full min-h-0 w-full items-center gap-3 overflow-hidden rounded-[22px] border border-white/10 px-3 py-2.5 text-left transition-colors duration-300 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 md:h-[220px] md:flex-col md:items-start md:justify-between md:rounded-[28px] md:p-5 lg:h-[240px] lg:p-6"
                      style={{ background: option.background }}
                    >
                      {/* Glow animasi */}
                      <motion.div
                        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl md:-right-12 md:-top-12 md:h-40 md:w-40"
                        style={{ background: `${option.accent}25` }}
                        animate={
                          reduceMotion
                            ? undefined
                            : {
                                opacity: [0.45, 0.9, 0.45],
                                scale: [0.9, 1.18, 0.9],
                              }
                        }
                        transition={{
                          duration: 4 + index,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.4,
                        }}
                      />

                      {/* Orbit dekoratif */}
                      {!reduceMotion && (
                        <motion.div
                          className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/[.07] md:-right-5 md:-top-5 md:h-32 md:w-32"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 24 + index * 5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <span
                            className="absolute left-3 top-3 h-2 w-2 rounded-full"
                            style={{
                              background: option.accent,
                              boxShadow: `0 0 12px ${option.accent}`,
                            }}
                          />
                        </motion.div>
                      )}

                      {/* Ikon */}
                      <div className="relative flex shrink-0 items-center justify-center">
                        <motion.div
                          className="grid h-12 w-12 place-items-center rounded-[16px] border border-white/10 md:h-[60px] md:w-[60px] md:rounded-[19px]"
                          style={{
                            background: `${option.accent}15`,
                            color: option.accent,
                          }}
                          whileHover={
                            reduceMotion
                              ? undefined
                              : {
                                  rotate: [0, -5, 5, 0],
                                  scale: 1.08,
                                }
                          }
                          transition={{ duration: 0.35 }}
                        >
                          <Icon className="h-6 w-6 md:h-7 md:w-7" />
                        </motion.div>
                      </div>

                      {/* Teks kartu */}
                      <div className="relative min-w-0 flex-1 md:w-full md:flex-none">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[8px] font-extrabold tracking-[.14em] md:text-[9px]"
                            style={{ color: option.accent }}
                          >
                            MEDIA 0{index + 1}
                          </span>
                        </div>

                        <h3 className="truncate text-sm font-black sm:text-base md:whitespace-normal md:text-lg lg:text-xl">
                          {option.title}
                        </h3>

                        <p className="line-clamp-1 text-[10px] leading-4 text-white/55 sm:text-xs md:mt-2 md:line-clamp-2 md:leading-5">
                          {option.subtitle}
                        </p>

                        <span
                          className="hidden text-[9px] font-extrabold tracking-[.12em] md:block"
                          style={{ color: option.accent }}
                        >
                          {option.label}
                        </span>
                      </div>

                      {/* Tombol panah */}
                      <motion.span
                        className="relative ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full md:h-10 md:w-10"
                        style={{
                          background: option.accent,
                          color: "#08152f",
                        }}
                        whileHover={
                          reduceMotion ? undefined : { x: 4, scale: 1.06 }
                        }
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>

            {/* Footer */}
            <motion.footer
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : 0.45,
              }}
              className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 pt-2"
            >
              <p className="truncate text-[9px] text-white/40 sm:text-xs">
                Setiap langkah membawamu pada ilmu baru.
              </p>

              <div className="flex shrink-0 items-center gap-1.5 text-[9px] font-bold text-white/50 sm:text-[10px]">
                <motion.span
                  className="flex"
                  animate={
                    reduceMotion ? undefined : { scale: [1, 1.15, 1] }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                </motion.span>
                READY TO LEARN
              </div>
            </motion.footer>
          </>
        ) : null}
      </div>
    </main>
  );
}