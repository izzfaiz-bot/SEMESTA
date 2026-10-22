// app/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  CloudRain,
  Maximize2,
  Mountain,
  Sparkles,
  Star,
  Waves,
  X,
  Zap,
} from "lucide-react";

type CategoryFromDB = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  topics: string[];
  emoji: string | null;
  sortOrder: number;
  isPublished: boolean;
};

type OrientationWithLock = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
  unlock?: () => void;
};

const stars = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  delay: `${(i % 9) * 0.4}s`,
  size: i % 7 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
}));

const categoryStyles = {
  geologi: {
    icon: Mountain,
    color: "#ffad62",
    glow: "rgba(255,145,65,.35)",
    background:
      "linear-gradient(145deg,#fff0cc 0%,#ffb36b 42%,#f56b46 100%)",
  },
  meteorologi: {
    icon: CloudRain,
    color: "#64e5ff",
    glow: "rgba(47,207,255,.35)",
    background:
      "linear-gradient(145deg,#e3fcff 0%,#75e5ff 45%,#438bff 100%)",
  },
  hidrologi: {
    icon: Waves,
    color: "#70f8d1",
    glow: "rgba(54,242,192,.3)",
    background:
      "linear-gradient(145deg,#d9fff0 0%,#6bf0cf 44%,#22a9ca 100%)",
  },
  astronomi: {
    icon: Atom,
    color: "#d1b0ff",
    glow: "rgba(184,126,255,.35)",
    background:
      "linear-gradient(145deg,#f4e5ff 0%,#c5a1ff 45%,#8870ff 100%)",
  },
} satisfies Record<
  string,
  {
    icon: typeof Mountain;
    color: string;
    glow: string;
    background: string;
  }
>;

export default function CategoriesPage() {
  const router = useRouter();
  const [fullscreen, setFullscreen] = useState(false);
  const [categories, setCategories] = useState<CategoryFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const syncFullscreen = () =>
      setFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", syncFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Format data kategori tidak valid.");
        }

        const publishedCategories = (data as CategoryFromDB[])
          .filter(
            (category) =>
              category.isPublished && category.slug in categoryStyles,
          )
          .sort(
            (a, b) =>
              a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
          );

        if (active) setCategories(publishedCategories);
      } catch (err) {
        console.error("Gagal memuat kategori:", err);

        if (active) {
          setError(
            "Kategori belum dapat dimuat. Periksa koneksi lalu coba lagi.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchCategories();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();

        const orientation = screen.orientation as OrientationWithLock;

        try {
          if (typeof orientation.lock === "function") {
            await orientation.lock("landscape");
          }
        } catch {
          // Penguncian orientasi tidak didukung semua perangkat.
        }
      } else {
        await document.exitFullscreen();

        const orientation = screen.orientation as OrientationWithLock;

        try {
          if (typeof orientation.unlock === "function") {
            orientation.unlock();
          }
        } catch {
          // Penguncian orientasi tidak didukung semua perangkat.
        }
      }
    } catch (err) {
      console.warn("Mode layar penuh tidak tersedia:", err);
    }
  };

  return (
    <main
      className="semesta category-space relative isolate h-[100svh] min-h-[320px] overflow-hidden font-sans text-white"
      style={{
        background:
          "radial-gradient(ellipse at 12% 18%,rgba(34,211,238,.3),transparent 36%),radial-gradient(ellipse at 85% 80%,rgba(139,92,246,.23),transparent 40%),linear-gradient(135deg,#123b83 0%,#0878c9 48%,#263d91 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_35%,rgba(125,211,252,.12),transparent_60%)]" />
      <div className="category-stars pointer-events-none absolute inset-0" />

      <div className="light-orb orb-cyan pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-cyan-300/25 blur-2xl" />
      <div className="light-orb orb-violet pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-violet-400/20 blur-2xl" />
      <div className="light-orb orb-blue pointer-events-none absolute left-1/2 top-[-100px] h-52 w-52 -translate-x-1/2 rounded-full bg-sky-300/20 blur-2xl" />

      {stars.map((star, i) => (
        <span
          key={i}
          className="category-twinkle pointer-events-none absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}

      <div className="planet-small pointer-events-none absolute left-[8%] top-[30%] h-10 w-10 rounded-full border border-cyan-100/40 bg-cyan-200/10" />

      <div className="planet-decoration pointer-events-none absolute right-[7%] top-[17%] h-12 w-12 rounded-full border-[4px] border-violet-200/90 bg-gradient-to-br from-pink-300 to-violet-600 shadow-[0_0_20px_rgba(192,132,252,.4)] sm:h-16 sm:w-16">
        <span className="absolute left-1 top-2 h-2 w-4 rounded-full bg-white/70" />
      </div>

      <Star className="decor-star pointer-events-none absolute left-[4%] top-[22%] h-5 w-5 fill-cyan-100 text-cyan-100" />
      <Sparkles className="decor-star pointer-events-none absolute bottom-[14%] right-[5%] h-7 w-7 text-violet-100" />

      <header className="relative z-20 mx-auto flex h-[64px] w-full max-w-[1440px] items-center justify-between px-4 sm:h-[76px] sm:px-7 lg:px-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Kembali ke halaman utama"
          className="glass-button group grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-100/40 bg-white/10 shadow-lg transition sm:h-11 sm:w-11"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Keluar dari layar penuh" : "Layar penuh"}
          title={fullscreen ? "Keluar dari layar penuh" : "Layar penuh"}
          className="glass-button grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-100/40 bg-white/10 text-cyan-50 shadow-lg transition sm:h-11 sm:w-11"
        >
          {fullscreen ? (
            <X className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </button>
      </header>

      <section className="relative z-10 mx-auto flex h-[calc(100svh-64px)] max-w-[1440px] flex-col px-4 pb-3 sm:h-[calc(100svh-76px)] sm:px-7 sm:pb-4 lg:px-10">
        <div className="category-heading shrink-0 pb-4 text-center sm:pb-5">
          <div className="mission-label mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100/40 bg-cyan-200/15 px-3 py-1.5 text-[9px] font-extrabold tracking-[.16em] text-white sm:mb-3 sm:px-4 sm:text-[10px]">
            <Sparkles className="h-3.5 w-3.5 text-yellow-200" />
            MISI PENJELAJAH CILIK
            <Sparkles className="h-3.5 w-3.5 text-yellow-200" />
          </div>

          <h1 className="text-[clamp(1.35rem,3.3vw,2.8rem)] font-black leading-tight tracking-tight text-white drop-shadow-lg">
            PILIH <span className="heading-gradient">PETUALANGAN!</span>
          </h1>

          <p className="mx-auto mt-1 max-w-xl text-[10px] font-medium text-white/90 sm:mt-2 sm:text-sm">
            Empat petualangan fenomena alam menakjubkan menanti!
            <br />
            Siapkah kamu menjadi penjelajah sains?
          </p>
        </div>

        <div className="category-grid grid min-h-0 flex-1 grid-cols-2 gap-3 pb-1 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-8 text-center lg:col-span-4">
              <div>
                <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-white/25 border-t-cyan-200" />
                <p className="text-sm font-bold text-white">
                  Menyiapkan petualangan sains...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="col-span-2 flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/20 bg-white/10 p-8 text-center lg:col-span-4">
              <p className="text-sm font-semibold text-white">{error}</p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="rounded-full border border-white/40 bg-white/15 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/25"
              >
                Coba Lagi
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-2 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-8 text-center lg:col-span-4">
              <p className="text-sm font-semibold text-white">
                Belum ada kategori yang dipublikasikan.
              </p>
            </div>
          ) : (
            categories.map((category, index) => {
              const style =
                categoryStyles[
                  category.slug as keyof typeof categoryStyles
                ];
              const Icon = style.icon;
              const number = String(category.sortOrder).padStart(2, "0");

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => router.push(`/categories/${category.slug}`)}
                  className="mission-card group relative flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/35 p-3 text-left text-white transition-[transform,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:rounded-[26px] sm:p-4 lg:p-5"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    ["--mission-glow" as string]: style.glow,
                    ["--mission-color" as string]: style.color,
                  }}
                >
                  <div
                    className="card-glow pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%,${style.glow},transparent 68%)`,
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-1">
                    <span className="rounded-full border border-white/45 bg-slate-950/20 px-2 py-1 text-[8px] font-black tracking-wider text-white sm:px-2.5 sm:text-[10px]">
                      FENOMENA {number}
                    </span>

                    <span className="category-icon grid h-7 w-7 place-items-center rounded-full border border-white/40 bg-white/15 text-white transition duration-300 group-hover:rotate-12 group-hover:scale-110 sm:h-9 sm:w-9">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                  </div>

                  <div className="card-art relative z-10 flex min-h-0 flex-1 items-center justify-center">
                    <div className="art-orbit absolute aspect-square h-[88%] rounded-full border border-dashed border-white/45" />
                    <div className="art-orbit art-orbit-two absolute aspect-square h-[68%] rounded-full border border-white/35" />
                    <div className="art-halo absolute aspect-square h-[72%] rounded-full bg-white/15" />

                    <div
                      className="mission-emoji relative z-10 flex aspect-square h-[74%] max-h-[150px] items-center justify-center rounded-[28%] border border-white/65 shadow-[inset_0_2px_12px_rgba(255,255,255,.45),0_8px_20px_rgba(20,40,100,.25)]"
                      style={{ background: style.background }}
                    >
                      <span className="emoji-symbol select-none drop-shadow-[0_6px_4px_rgba(50,40,90,.25)]">
                        {category.emoji || "🔭"}
                      </span>

                      <span className="absolute right-[14%] top-[13%] h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_white] sm:h-3 sm:w-3" />
                      <Sparkles className="emoji-sparkle absolute bottom-[13%] left-[12%] h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>

                    <span className="mini-star absolute left-[8%] top-[20%] text-white">
                      ✦
                    </span>
                    <span className="mini-star mini-star-delay absolute bottom-[16%] right-[8%] text-white">
                      ✧
                    </span>
                  </div>

                  <div className="relative z-10 shrink-0 text-white">
                    <p className="text-[9px] font-extrabold uppercase tracking-[.14em] text-white/80 sm:text-[10px]">
                      {category.subtitle || "Petualangan Sains"}
                    </p>

                    <h2 className="mt-0.5 text-[clamp(.78rem,1.5vw,1.3rem)] font-black leading-tight tracking-tight text-white drop-shadow-md sm:mt-1">
                      {category.name}
                    </h2>

                    <p className="mt-1 hidden text-[11px] font-semibold leading-relaxed text-white/85 sm:block lg:text-xs">
                      {category.description ||
                        "Jelajahi fenomena alam bersama SEMESTA!"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1 sm:mt-3 sm:gap-1.5">
                      {category.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-white/35 bg-white/10 px-1.5 py-1 text-[8px] font-bold leading-none text-white sm:px-2 sm:text-[9px]"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-white/20 pt-2 sm:mt-4 sm:pt-3">
                      <span className="text-[9px] font-black tracking-wide text-white sm:text-[11px]">
                        MULAI MISI
                      </span>

                      <span className="card-arrow grid h-7 w-7 place-items-center rounded-full border border-white/45 bg-white/15 text-white sm:h-8 sm:w-8">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  <div className="card-shine pointer-events-none absolute inset-y-0 -left-1/2 z-20 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0" />
                </button>
              );
            })
          )}
        </div>

        <footer className="relative z-10 flex shrink-0 items-center justify-center gap-2 pt-2 text-[8px] font-bold tracking-[.18em] text-white/85 sm:pt-3 sm:text-[10px]">
          <Zap className="h-3 w-3 text-yellow-200" />
          EXPLORE <span className="text-cyan-200">✦</span> DISCOVER{" "}
          <span className="text-violet-200">✦</span> LEARN
          <Zap className="h-3 w-3 text-yellow-200" />
        </footer>
      </section>

      <style jsx>{`
        .category-stars {
          background-image:
            radial-gradient(1.5px 1.5px at 20px 30px,rgba(255,255,255,.8) 50%,transparent 100%),
            radial-gradient(2px 2px at 120px 90px,rgba(165,243,252,.7) 50%,transparent 100%),
            radial-gradient(1px 1px at 70px 160px,rgba(255,255,255,.7) 50%,transparent 100%);
          background-size: 180px 180px,230px 230px,150px 150px;
          animation: star-drift 55s linear infinite;
          opacity: .65;
          contain: strict;
        }

        .category-twinkle {
          opacity: .35;
          animation: star-twinkle 4s ease-in-out infinite;
        }

        .heading-gradient {
          background: linear-gradient(90deg,#fff0a6 0%,#9af4ff 48%,#e0c4ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 2px 8px rgba(103,232,249,.3));
        }

        .category-heading {
          animation: heading-enter .6s ease-out both;
        }

        .mission-label {
          animation: label-glow 4s ease-in-out infinite alternate;
        }

        .mission-card {
          isolation: isolate;
          background: linear-gradient(145deg,rgba(255,255,255,.16),rgba(170,220,255,.06));
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: card-enter .55s ease-out both;
          box-shadow: 0 8px 20px rgba(1,15,55,.16),inset 0 1px 0 rgba(255,255,255,.1);
          transform: translateZ(0);
        }

        .mission-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          border-radius: inherit;
          background: linear-gradient(145deg,var(--mission-glow),transparent 70%);
          opacity: .25;
          transition: opacity .25s ease;
        }

        .mission-card:hover {
          transform: translateY(-4px);
          border-color: var(--mission-color);
          box-shadow: 0 12px 25px var(--mission-glow),inset 0 0 15px rgba(255,255,255,.06);
        }

        .mission-card:hover::before {
          opacity: .8;
        }

        .mission-card:active {
          transform: scale(.985);
        }

        .card-glow {
          opacity: .45;
          transition: opacity .25s ease;
        }

        .mission-card:hover .card-glow {
          opacity: .85;
        }

        .card-art {
          perspective: 600px;
        }

        .art-orbit {
          animation: orbit-spin 30s linear infinite;
          will-change: transform;
        }

        .art-orbit-two {
          animation: orbit-spin 24s linear infinite reverse;
        }

        .mission-card:hover .art-orbit {
          animation-duration: 18s;
        }

        .art-halo {
          opacity: .7;
        }

        .mission-emoji {
          animation: emoji-float 5s ease-in-out infinite;
          transition: transform .3s ease,filter .3s ease;
          transform: rotate(-3deg);
        }

        .mission-card:nth-child(even) .mission-emoji {
          animation-delay: -2s;
        }

        .mission-card:hover .mission-emoji {
          transform: rotate(3deg) scale(1.05);
          filter: saturate(1.1) brightness(1.04);
        }

        .emoji-symbol {
          font-size: clamp(2.5rem,6vw,5rem);
          line-height: 1;
          transition: transform .3s ease;
        }

        .mission-card:hover .emoji-symbol {
          transform: scale(1.08);
        }

        .emoji-sparkle {
          animation: sparkle-pulse 3s ease-in-out infinite;
        }

        .category-icon {
          box-shadow: 0 0 10px rgba(255,255,255,.06);
        }

        .card-arrow {
          transition: transform .2s ease,background .2s ease;
        }

        .mission-card:hover .card-arrow {
          transform: translateX(3px);
          background: rgba(255,255,255,.25);
        }

        .card-shine {
          transform: translateX(-130%) skewX(-12deg);
        }

        .mission-card:hover .card-shine {
          opacity: .8;
          animation: card-shine .8s ease-out;
        }

        .mini-star {
          font-size: 1.3rem;
          animation: mini-twinkle 3s ease-in-out infinite;
          text-shadow: 0 0 8px rgba(255,255,255,.6);
        }

        .mini-star-delay {
          animation-delay: 1s;
        }

        .decor-star {
          animation: decor-float 4s ease-in-out infinite;
        }

        .orb-cyan {
          animation: orb-breathe 9s ease-in-out infinite alternate;
        }

        .orb-violet {
          animation: orb-breathe 11s ease-in-out infinite alternate-reverse;
        }

        .orb-blue {
          animation: orb-breathe 10s ease-in-out infinite alternate;
        }

        .planet-decoration {
          animation: planet-drift 9s ease-in-out infinite;
        }

        .planet-small {
          animation: planet-small-drift 10s ease-in-out infinite;
        }

        .glass-button {
          transition: background .2s ease,border-color .2s ease;
        }

        .glass-button:hover {
          border-color: rgba(165,243,252,.8);
          background: rgba(103,232,249,.18);
        }

        @keyframes star-twinkle {
          0%,100% { opacity: .25; transform: scale(.9); }
          50% { opacity: .8; transform: scale(1.2); }
        }

        @keyframes card-enter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heading-enter {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes emoji-float {
          0%,100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-4px) rotate(-1deg); }
        }

        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes mini-twinkle {
          0%,100% { opacity: .45; transform: scale(.9); }
          50% { opacity: .9; transform: scale(1.1); }
        }

        @keyframes decor-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes orb-breathe {
          from { opacity: .45; }
          to { opacity: .8; }
        }

        @keyframes planet-drift {
          0%,100% { transform: translate(0,0) rotate(-5deg); }
          50% { transform: translate(-4px,6px) rotate(6deg); }
        }

        @keyframes planet-small-drift {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(5px,-5px); }
        }

        @keyframes card-shine {
          from { transform: translateX(-130%) skewX(-12deg); }
          to { transform: translateX(450%) skewX(-12deg); }
        }

        @keyframes star-drift {
          from { background-position: 0 0,0 0,0 0; }
          to { background-position: 180px 180px,-230px 230px,150px -150px; }
        }

        @keyframes label-glow {
          from { box-shadow: 0 0 6px rgba(34,211,238,.05); }
          to { box-shadow: 0 0 15px rgba(34,211,238,.16); }
        }

        @keyframes sparkle-pulse {
          0%,100% { opacity: .65; }
          50% { opacity: 1; }
        }

        @media (max-height: 480px) {
          .category-heading {
            padding-bottom: .4rem;
          }

          .category-heading > div {
            margin-bottom: .2rem;
            padding-top: .2rem;
            padding-bottom: .2rem;
          }

          .category-heading p:last-child {
            margin-top: .1rem;
          }

          .mission-card {
            padding: .55rem;
            border-radius: 15px;
          }

          .category-grid {
            gap: .55rem;
          }

          .mission-card .card-art {
            flex-basis: 0;
          }

          .mission-card .mission-emoji {
            max-height: 90px;
          }

          .mission-card .emoji-symbol {
            font-size: clamp(2rem,7vh,3.4rem);
          }

          .mission-card .card-arrow {
            width: 1.5rem;
            height: 1.5rem;
          }

          .mission-card .card-arrow svg {
            width: .8rem;
            height: .8rem;
          }

          .category-space footer {
            padding-top: .2rem;
          }
        }

        @media (hover: none) {
          .mission-card:hover {
            transform: none;
          }

          .mission-card:hover .card-shine {
            animation: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>
    </main>
  );
}