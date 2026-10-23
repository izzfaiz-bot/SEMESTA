// app/categories/[slug]/page.tsx
"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  BookOpen,
  Compass,
  CloudRain,
  Maximize,
  Mountain,
  RefreshCw,
  Rocket,
  Sparkles,
  Sun,
  Waves,
  X,
} from "lucide-react";

type Phenomenon = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

type CategoryDetail = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  topics: string[];
  emoji: string | null;
  sortOrder: number;
  phenomena: Phenomenon[];
};

const themes = {
  geologi: {
    accent: "#ffb36b",
    secondary: "#ff6848",
    background: "linear-gradient(145deg,#281711 0%,#592719 48%,#171426 100%)",
    glow: "rgba(255,111,55,.26)",
    card: "linear-gradient(145deg,rgba(255,160,75,.2),rgba(255,255,255,.045))",
    label: "EARTH EXPLORER",
    intro:
      "Peristiwa alam yang terjadi akibat proses di dalam bumi maupun di permukaan bumi yang berkaitan dengan batuan, struktur bumi, dan pergerakan lempeng tektonik.",
    icon: Mountain,
    orb: "radial-gradient(circle,rgba(255,139,65,.3),transparent 70%)",
  },
  meteorologi: {
    accent: "#8be8ff",
    secondary: "#5c9dff",
    background: "linear-gradient(145deg,#071d3a 0%,#104b7b 50%,#101d43 100%)",
    glow: "rgba(65,190,255,.25)",
    card: "linear-gradient(145deg,rgba(91,201,255,.2),rgba(255,255,255,.045))",
    label: "WEATHER EXPLORER",
    intro:
      "Peristiwa alam yang terjadi di atmosfer atau lapisan udara yang menyelimuti Bumi. Fenomena ini berkaitan dengan kondisi cuaca dan proses yang memengaruhinya, seperti suhu udara, tekanan udara, kelembapan, angin, serta pembentukan awan.",
    icon: CloudRain,
    orb: "radial-gradient(circle,rgba(76,190,255,.3),transparent 70%)",
  },
  hidrologi: {
    accent: "#81ffe1",
    secondary: "#35bce9",
    background: "linear-gradient(145deg,#062a35 0%,#07596a 48%,#10253f 100%)",
    glow: "rgba(48,238,197,.24)",
    card: "linear-gradient(145deg,rgba(61,231,199,.19),rgba(255,255,255,.045))",
    label: "OCEAN EXPLORER",
    intro:
      "Peristiwa alam yang berkaitan dengan pergerakan, persebaran, dan perubahan air di Bumi, baik di permukaan, di dalam tanah, maupun di atmosfer.",
    icon: Waves,
    orb: "radial-gradient(circle,rgba(38,229,193,.3),transparent 70%)",
  },
  astronomi: {
    accent: "#dfc2ff",
    secondary: "#a58aff",
    background: "linear-gradient(145deg,#100e32 0%,#29215d 48%,#100e2c 100%)",
    glow: "rgba(175,123,255,.28)",
    card: "linear-gradient(145deg,rgba(183,140,255,.2),rgba(255,255,255,.045))",
    label: "SPACE EXPLORER",
    intro:
      "Peristiwa alam yang terjadi di luar atmosfer bumi atau melibatkan benda-benda langit, seperti Matahari, Bulan, planet, bintang, dan benda langit lainnya. Fenomena ini terjadi akibat berbagai proses alam, seperti pergerakan benda langit, gaya gravitasi, serta interaksi antara benda-benda di ruang angkasa.",
    icon: Atom,
    orb: "radial-gradient(circle,rgba(176,117,255,.3),transparent 70%)",
  },
} as const;

const phenomenonEmojis: Record<string, string> = {
  "gempa-bumi": "🌎",
  "gunung-meletus": "🌋",
  "tanah-longsor": "⛰️",
  hujan: "🌧️",
  kekeringan: "☀️",
  "angin-puting-beliung": "🌪️",
  pelangi: "🌈",
  banjir: "🌊",
  abrasi: "🏝️",
  "siklus-air": "💧",
  "gerhana-bulan": "🌕",
  "gerhana-matahari": "🌑",
  "siang-dan-malam": "🌗",
};

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef(0);

  const theme = themes[slug as keyof typeof themes];
  const CategoryIcon = theme?.icon ?? Compass;

  const loadCategory = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/categories/${encodeURIComponent(slug)}`,
          { signal },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Kategori tidak ditemukan atau belum dipublikasikan."
              : "Kategori gagal dimuat. Silakan coba kembali.",
          );
        }

        const data = (await response.json()) as CategoryDetail;
        setCategory(data);
        setActiveIndex(0);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat kategori.",
        );
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadCategory(controller.signal);
    return () => controller.abort();
  }, [loadCategory, retryCount]);

  // Deteksi fullscreen seperti halaman utama SEMESTA.
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

      try {
        const orientation = window.screen.orientation as ScreenOrientation & {
          lock?: (orientation: "landscape" | "portrait") => Promise<void>;
        };

        if (typeof orientation.lock === "function") {
          await orientation.lock("landscape");
        }
      } catch {
        // Penguncian orientasi tidak didukung di semua browser.
      }
    } else {
      await document.exitFullscreen();
    }
  } catch {
    // Browser mungkin tidak mendukung mode layar penuh.
  }
};

  const scrollToCard = useCallback((index: number) => {
    const cards = cardRefs.current;
    if (!cards.length) return;

    const nextIndex = Math.max(0, Math.min(index, cards.length - 1));
    setActiveIndex(nextIndex);

    cards[nextIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, []);

  const moveCard = (direction: number) => {
    scrollToCard(activeIndex + direction);
  };

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;

    const center = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const difference = touchStartX.current - endX;

    if (Math.abs(difference) > 55) {
      moveCard(difference > 0 ? 1 : -1);
    }
  };

  return (
    <main
      className="semesta-page relative isolate flex h-[100dvh] min-h-0 flex-col overflow-hidden font-sans text-white"
      style={{
        background:
          theme?.background ??
          "linear-gradient(145deg,#0b1c3c,#17477b,#171b47)",
      }}
    >
      <div className="semesta-stars pointer-events-none absolute inset-0 -z-10" />

      <div
        className="pointer-events-none absolute -left-32 top-20 -z-10 h-96 w-96 rounded-full blur-3xl"
        style={{ background: theme?.glow }}
      />

      <div
        className="pointer-events-none absolute -right-36 top-[35%] -z-10 h-[440px] w-[440px] rounded-full blur-3xl"
        style={{ background: theme?.orb }}
      />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/5 via-transparent to-black/25" />

      {/* Navigasi */}
      <header className="relative z-20 mx-auto flex h-[64px] w-full max-w-[1440px] items-center justify-between px-4 sm:h-[76px] sm:px-7 lg:px-10">
        <button
          type="button"
          onClick={() => router.push("/categories")}
          aria-label="Kembali ke kategori"
          className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-white/[.07] transition hover:bg-white/15 sm:h-11 sm:w-11"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5 text-left"
          aria-label="Beranda SEMESTA"
        ></button>

        {!isFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Masuk layar penuh"
            title="Masuk layar penuh"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-white/[.07] transition hover:bg-white/15 sm:h-11 sm:w-11"
          >
            <Maximize className="h-5 w-5" />
          </button>
        )}
      </header>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col overflow-hidden px-4 sm:px-7 lg:px-10">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div
              className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-white"
              style={{ borderTopColor: theme?.accent }}
            />
            <h1 className="text-lg font-black">Menyiapkan petualangan...</h1>
            <p className="mt-2 text-sm text-white/55">
              Memuat misi sains dari SEMESTA.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Compass
              className="mb-4 h-12 w-12"
              style={{ color: theme?.accent }}
            />
            <h1 className="text-2xl font-black">Misi belum tersedia</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/15"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
          </div>
        ) : category ? (
          <>
            {/* Hero */}
            <section className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden py-2 sm:py-3">
              <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-2 md:grid-cols-[1.1fr_.9fr] md:gap-6 lg:gap-10">
                <div className="hero-enter relative z-10 flex min-w-0 flex-col items-center text-center md:items-start md:text-left">
                  <div
                    className="relative mb-2 grid h-12 w-12 place-items-center rounded-2xl border border-white/20 shadow-xl sm:h-16 sm:w-16 md:hidden"
                    style={{
                      background: theme?.card,
                      boxShadow: `0 0 40px ${theme?.glow}`,
                    }}
                  >
                    <span className="text-3xl sm:text-4xl">
                      {category.emoji || "🔭"}
                    </span>
                  </div>

                  <div className="mt-2 mb-0 flex flex-nowrap items-center gap-2 sm:mt-10 sm:mb-0 sm:gap-3">
                    <div
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-extrabold tracking-[.12em] sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[.18em]"
                      style={{
                        color: theme?.accent,
                        borderColor: `${theme?.accent}50`,
                        background: `${theme?.accent}12`,
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      {theme?.label ?? "SCIENCE EXPLORER"}
                    </div>

                    <span className="shrink-0 text-[9px] font-bold opacity-50">
                      |
                    </span>

                    <p
                      className="min-w-0 truncate text-[9px] font-extrabold uppercase tracking-[.12em] sm:text-[10px] sm:tracking-[.2em]"
                      style={{ color: theme?.accent }}
                    >
                      {category.subtitle || "Petualangan Sains"}
                    </p>
                  </div>

                  <h1 className="mt-1 text-[clamp(1.75rem,5.5vw,3.5rem)] font-black leading-[1.02] tracking-tight">
                    Jelajahi
                    <span
                      className="block"
                      style={{
                        color: theme?.accent,
                        textShadow: `0 0 35px ${theme?.glow}`,
                      }}
                    >
                      {category.name}
                    </span>
                  </h1>

                  <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-white/70 sm:mt-3 sm:text-sm sm:leading-6">
                    {theme?.intro ??
                      category.description ??
                      "Temukan berbagai fenomena sains menarik."}
                  </p>
                </div>

                {/* Ilustrasi kategori */}
                <div className="relative mx-auto hidden h-[min(34vh,300px)] w-full max-w-[350px] items-center justify-center md:flex">
                  <div
                    className="absolute inset-5 rounded-full blur-3xl"
                    style={{ background: theme?.glow }}
                  />
                  <div className="category-orbit absolute h-[min(30vh,260px)] w-[min(30vh,260px)] rounded-full border border-dashed border-white/15" />
                  <div className="absolute h-[min(23vh,200px)] w-[min(23vh,200px)] rounded-full border border-white/10" />

                  <div
                    className="relative grid h-[min(19vh,165px)] w-[min(19vh,165px)] place-items-center rounded-[42px] border border-white/20 shadow-2xl"
                    style={{
                      background: theme?.card,
                      boxShadow: `0 0 80px ${theme?.glow}, inset 0 1px 0 rgba(255,255,255,.15)`,
                    }}
                  >
                    <span className="text-7xl drop-shadow-2xl">
                      {category.emoji || "🔭"}
                    </span>

                    <span className="absolute -right-4 top-5 grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-black/20 shadow-xl backdrop-blur-xl">
                      <CategoryIcon
                        className="h-5 w-5"
                        style={{ color: theme?.accent }}
                      />
                    </span>

                    <span className="absolute -bottom-3 -left-4 grid h-10 w-10 place-items-center rounded-2xl border border-white/20 bg-black/20 shadow-xl backdrop-blur-xl">
                      <Sun
                        className="h-5 w-5"
                        style={{ color: theme?.accent }}
                      />
                    </span>
                  </div>

                  <div className="absolute right-0 top-2 rounded-2xl border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-xl">
                    <p className="text-[8px] font-bold tracking-[.15em] text-white/45">
                      YOUR DESTINATION
                    </p>
                    <p
                      className="mt-1 text-xs font-black"
                      style={{ color: theme?.accent }}
                    >
                      {category.name}
                    </p>
                  </div>

                  <div className="absolute bottom-2 left-0 rounded-2xl border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-xl">
                    <p className="text-[8px] font-bold tracking-[.15em] text-white/45">
                      DISCOVER MORE
                    </p>
                    <p className="mt-1 text-xs font-black">
                      Science is everywhere
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Materi */}
            <section className="shrink-0 pb-3 pt-2 sm:pb-4 sm:pt-3">
              <div className="mb-2 flex items-end justify-between gap-3 sm:mb-3">
                <div>
                  <p
                    className="text-[8px] font-extrabold tracking-[.22em] sm:text-[9px]"
                    style={{ color: theme?.accent }}
                  >
                    CHOOSE YOUR MISSION
                  </p>
                  <h2 className="mt-1 text-base font-black sm:text-xl">
                    Pilih Petualanganmu
                  </h2>
                  <p className="mt-1 text-[10px] text-white/50 sm:text-xs">
                    Geser kartu ke kanan atau kiri untuk menjelajah.
                  </p>
                </div>

                <span className="mb-1 flex shrink-0 items-center gap-1.5 text-[9px] font-bold text-white/45">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: theme?.accent }}
                  />
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(category.phenomena.length).padStart(2, "0")}
                </span>
              </div>

              {category.phenomena.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-6 text-center">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 text-white/35" />
                  <h3 className="text-sm font-black">Misi segera hadir!</h3>
                  <p className="mt-1 text-xs text-white/55">
                    Belum ada fenomena yang dipublikasikan dalam kategori ini.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    ref={trackRef}
                    onScroll={handleTrackScroll}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="horizontal-missions flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:gap-4"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {category.phenomena.map((phenomenon, index) => (
                      <button
                        id={`phenomenon-${index}`}
                        key={phenomenon.id}
                        ref={(element) => {
                          cardRefs.current[index] = element;
                        }}
                        type="button"
                        onClick={() =>
                          router.push(`/phenomena/${phenomenon.slug}`)
                        }
                        className="mission-card group relative flex h-[clamp(155px,23dvh,205px)] w-[74vw] max-w-[270px] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-white/15 p-3.5 text-left transition duration-300 hover:border-white/35 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 sm:h-[190px] sm:w-[285px] sm:max-w-none sm:rounded-3xl sm:p-4"
                        style={{
                          background: theme?.card,
                          boxShadow: "0 12px 32px rgba(0,0,0,.12)",
                        }}
                      >
                        <div
                          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
                          style={{ background: theme?.glow }}
                        />

                        <div className="relative z-10 flex items-center justify-between">
                          <span
                            className="rounded-full border px-2.5 py-1 text-[8px] font-extrabold tracking-[.15em]"
                            style={{
                              borderColor: `${theme?.accent}55`,
                              color: theme?.accent,
                              background: `${theme?.accent}0d`,
                            }}
                          >
                            MATERI {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-black/10">
                            <Sparkles
                              className="h-3.5 w-3.5"
                              style={{ color: theme?.accent }}
                            />
                          </span>
                        </div>

                        <div className="relative z-10 flex min-h-0 flex-1 items-center gap-3 py-3">
                          {phenomenon.imageUrl ? (
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black/10 sm:h-[76px] sm:w-[76px]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={phenomenon.imageUrl}
                                alt={phenomenon.title}
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            </div>
                          ) : (
                            <div
                              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/15 text-3xl sm:h-[76px] sm:w-[76px] sm:text-4xl"
                              style={{ background: `${theme?.accent}13` }}
                            >
                              {phenomenonEmojis[phenomenon.slug] || "🔬"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-sm font-black leading-snug sm:text-base">
                              {phenomenon.title}
                            </h3>
                            <p className="mt-1.5 line-clamp-3 text-[10px] leading-relaxed text-white/60 sm:text-xs">
                              {phenomenon.description ||
                                "Temukan penjelasan ilmiah dan fakta menarik dari fenomena ini."}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5">
                          <span className="text-[8px] font-extrabold tracking-[.13em] text-white/75 sm:text-[9px]">
                            JELAJAHI MATERI
                          </span>

                          <span
                            className="grid h-7 w-7 place-items-center rounded-full transition duration-300 group-hover:translate-x-1 sm:h-8 sm:w-8"
                            style={{
                              background: theme?.accent,
                              color: "#142036",
                            }}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    {category.phenomena.map((phenomenon, index) => (
                      <button
                        key={phenomenon.id}
                        type="button"
                        aria-label={`Pilih materi ${index + 1}`}
                        onClick={() => scrollToCard(index)}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: activeIndex === index ? 24 : 6,
                          background:
                            activeIndex === index
                              ? theme?.accent
                              : "rgba(255,255,255,.25)",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Footer */}
            <footer className="mt-auto flex h-8 shrink-0 items-center justify-between border-t border-white/10 text-[8px] text-white/35 sm:h-9">
              <div className="flex items-center gap-2">
                <Rocket
                  className="h-3.5 w-3.5"
                  style={{ color: theme?.accent }}
                />
                <span className="font-black tracking-[.16em]">SEMESTA</span>
              </div>

              <span className="font-bold tracking-[.12em]">
                EXPLORE <span style={{ color: theme?.accent }}>✦</span> DISCOVER{" "}
                <span style={{ color: theme?.accent }}>✦</span> LEARN
              </span>
            </footer>
          </>
        ) : null}
      </div>

      <style jsx>{`
        .semesta-stars {
          background-image:
            radial-gradient(
              1.5px 1.5px at 20px 30px,
              rgba(255, 255, 255, 0.8) 50%,
              transparent 100%
            ),
            radial-gradient(
              2px 2px at 120px 90px,
              rgba(255, 255, 255, 0.6) 50%,
              transparent 100%
            ),
            radial-gradient(
              1px 1px at 70px 160px,
              rgba(255, 255, 255, 0.6) 50%,
              transparent 100%
            );
          background-size: 180px 180px, 230px 230px, 150px 150px;
          opacity: 0.5;
        }

        .hero-enter {
          animation: hero-enter 0.65s ease-out both;
        }

        .category-orbit {
          animation: orbit-spin 45s linear infinite;
        }

        .horizontal-missions {
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-x pan-y;
        }

        .horizontal-missions::-webkit-scrollbar {
          display: none;
        }

        .mission-card {
          isolation: isolate;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        @keyframes hero-enter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes orbit-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-height: 650px) {
          .hero-enter {
            animation: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}