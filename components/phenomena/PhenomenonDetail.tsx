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
  Rocket,
  Sparkles,
} from "lucide-react";
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

export default function PhenomenonDetail({ slug }: Props) {
  const router = useRouter();
  const [phenomenon, setPhenomenon] = useState<Phenomenon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPhenomenon() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/phenomena/${encodeURIComponent(slug)}`,
          { signal: controller.signal, cache: "no-store" },
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

  const emoji = phenomenonEmojis[slug] ?? phenomenonEmojis.default;

  return (
    <main className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#08152f] font-sans text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(57,125,214,.24),transparent_45%),radial-gradient(ellipse_at_85%_75%,rgba(133,87,230,.18),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:35px_35px]" />

      <header className="relative z-10 flex h-[62px] shrink-0 items-center justify-between border-b border-white/10 px-4 sm:h-[70px] sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => router.push("/categories")}
          aria-label="Kembali ke kategori"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.06] transition hover:bg-white/15"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Halaman utama SEMESTA"
          className="flex items-center gap-2.5"
        >
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center sm:w-auto sm:gap-2 sm:rounded-full sm:border sm:border-white/10 sm:bg-white/[.05] sm:px-3">
          <Sparkles className="h-4 w-4 text-cyan-200" />
          <span className="hidden text-[10px] font-bold text-white/60 sm:inline">
            LEARN & EXPLORE
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-8 sm:py-4 lg:px-12">
        {loading ? (
          <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cyan-200" />
            <p className="text-sm font-bold">Menyiapkan materi...</p>
            <p className="mt-1 text-xs text-white/45">
              Petualangan sainsmu segera dimulai.
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
            <BookOpen className="mb-3 h-10 w-10 text-cyan-200" />
            <h1 className="text-xl font-black">Materi belum tersedia</h1>
            <p className="mt-2 max-w-sm text-sm text-white/60">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/categories")}
              className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-cyan-100"
            >
              Kembali ke Kategori
            </button>
          </div>
        ) : phenomenon ? (
          <>
            <section className="flex shrink-0 flex-col items-center text-center">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-200/20 bg-cyan-200/[.07] px-3 py-1.5 text-[9px] font-extrabold tracking-[.18em] text-cyan-100 sm:mb-3 sm:text-[10px]">
                <Sparkles className="h-3.5 w-3.5" />
                MATERI {String(phenomenon.sortOrder).padStart(2, "0")}
              </div>

              <div className="mb-2 grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-[19px] border border-white/10 bg-white/[.06] text-4xl shadow-lg shadow-cyan-950/20 sm:mb-3 sm:h-[70px] sm:w-[70px] sm:rounded-[22px] sm:text-5xl">
                {phenomenon.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={phenomenon.imageUrl}
                    alt={phenomenon.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  emoji
                )}
              </div>

              <h1 className="max-w-full text-2xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Jelajahi{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                  {phenomenon.title}
                </span>
              </h1>

              <p className="mt-2 line-clamp-2 max-w-xl text-xs leading-5 text-white/60 sm:mt-3 sm:text-sm sm:leading-6">
                {phenomenon.description ||
                  "Temukan hal menarik dan pelajari konsep di balik fenomena sains ini."}
              </p>

              <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-white/50 sm:mt-3 sm:text-xs">
                <BookOpen className="h-3.5 w-3.5 text-cyan-200" />
                3 media pembelajaran
                <span className="text-white/20">•</span>
                Belajar sesuai waktumu
              </div>
            </section>

            <section className="flex min-h-0 flex-1 flex-col">
              <div className="mb-2 flex shrink-0 items-end justify-between gap-2 sm:mb-3">
                <div>
                  <p className="text-[9px] font-extrabold tracking-[.18em] text-cyan-200 sm:text-[10px]">
                    CHOOSE YOUR LEARNING PATH
                  </p>
                  <h2 className="mt-1 text-base font-black sm:text-xl">
                    Mulai Petualanganmu
                  </h2>
                </div>
                <span className="pb-0.5 text-[9px] text-white/35 sm:text-xs">
                  Pilih media belajar
                </span>
              </div>

              <div className="grid min-h-0 flex-1 grid-rows-3 gap-2.5 md:grid-cols-3 md:grid-rows-1 md:gap-4">
                {mediaOptions.map((option, index) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => router.push(option.href(slug))}
                      aria-label={`Buka ${option.title}`}
                      className="group relative flex min-h-0 w-full items-center gap-3 overflow-hidden rounded-[22px] border border-white/10 px-3 py-2.5 text-left transition duration-300 hover:border-white/30 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 md:flex-col md:items-start md:justify-between md:rounded-[28px] md:p-5 lg:p-6"
                      style={{ background: option.background }}
                    >
                      <div
                        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition duration-500 group-hover:scale-125 md:-right-12 md:-top-12 md:h-40 md:w-40"
                        style={{ background: `${option.accent}20` }}
                      />

                      <div className="relative flex shrink-0 items-center justify-center">
                        <div
                          className="grid h-12 w-12 place-items-center rounded-[16px] border border-white/10 md:h-[60px] md:w-[60px] md:rounded-[19px]"
                          style={{
                            background: `${option.accent}15`,
                            color: option.accent,
                          }}
                        >
                          <Icon className="h-6 w-6 md:h-7 md:w-7" />
                        </div>
                      </div>

                      <div className="relative min-w-0 flex-1 md:w-full md:flex-none">
                        <div className="mb-1 flex items-center gap-2">
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
                        <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-white/55 sm:text-xs md:mt-2 md:line-clamp-2 md:leading-5">
                          {option.subtitle}
                        </p>

                        <span
                          className="mt-3 hidden text-[9px] font-extrabold tracking-[.12em] md:block"
                          style={{ color: option.accent }}
                        >
                          {option.label}
                        </span>
                      </div>

                      <span
                        className="relative ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full transition duration-300 group-hover:translate-x-1 md:h-10 md:w-10"
                        style={{
                          background: option.accent,
                          color: "#08152f",
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 pt-2">
              <p className="truncate text-[9px] text-white/40 sm:text-xs">
                Setiap langkah membawamu pada ilmu baru.
              </p>
              <div className="flex shrink-0 items-center gap-1.5 text-[9px] font-bold text-white/50 sm:text-[10px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                READY TO LEARN
              </div>
            </footer>
          </>
        ) : null}
      </div>
    </main>
  );
}