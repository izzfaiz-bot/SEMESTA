// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SemestaInfoModal from "@/components/home/SemestaInfoModal";
import {
  Settings,
  Info,
  ArrowRight,
  Atom,
  Play,
  Sparkles,
  Star,
  Telescope,
  Trophy,
} from "lucide-react";
import Image from "next/image";

const stars = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 37 + 7) % 100}%`,
  top: `${(i * 53 + 3) % 100}%`,
  delay: `${(i % 8) * 0.35}s`,
  size: i % 5 === 0 ? 4 : 2,
}));

export default function HomePage() {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <main
      className="semesta relative isolate h-[100svh] min-h-[600px] overflow-hidden font-sans text-white"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="stars pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-300/30 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-violet-500/30 blur-[120px]" />

      {stars.map((star, i) => (
        <span
          key={i}
          className="twinkle pointer-events-none absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Header */}
      <header className="relative z-20 mx-auto flex h-[88px] w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/50 bg-white shadow-lg shadow-cyan-950/10">
            <Image
              src="/logo-semesta.jpeg"
              alt="Logo SEMESTA"
              width={48}
              height={48}
              priority
              className="h-full w-full rounded-full object-contain p-0.5"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xl font-black tracking-[0.16em] sm:text-2xl">
              SEMESTA
            </p>
            <p className="text-[10px] font-bold tracking-[0.12em] text-cyan-50/80 sm:text-xs sm:tracking-[0.22em]">
              Serunya Menjelajahi Sains dan Tata Alam
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Tombol login admin */}
          <button
            type="button"
            onClick={() => router.push("/login")}
            aria-label="Login Admin"
            title="Login Admin"
            className="group grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/40 bg-white/15 text-white shadow-lg shadow-sky-950/10 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:rotate-12 hover:border-yellow-200/70 hover:bg-white/25 hover:text-yellow-200 active:translate-y-0 sm:h-12 sm:w-12"
          >
            <Settings className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90 sm:h-6 sm:w-6" />
          </button>

          {/* Tombol informasi */}
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            aria-label="Informasi SEMESTA"
            aria-haspopup="dialog"
            title="Tentang SEMESTA"
            className="group grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/40 bg-white/15 text-white shadow-lg shadow-sky-950/10 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/70 hover:bg-white/25 hover:text-cyan-100 active:translate-y-0 sm:h-12 sm:w-12"
          >
            <Info className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
          </button>
        </div>
      </header>

      {/* Konten utama */}
      <section className="relative z-10 mx-auto grid min-h-[calc(100svh-88px)] max-w-7xl grid-cols-1 items-center gap-0 px-5 pb-8 sm:px-8 md:h-[calc(100svh-88px)] md:min-h-0 md:grid-cols-[1fr_1fr] md:gap-4 md:pb-10 lg:px-12">
        <div className="relative z-10 mx-auto w-full max-w-xl text-center md:mx-0 md:text-left">
          <div className="enter mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-100/40 bg-cyan-200/15 px-4 py-2 text-xs font-extrabold tracking-wide text-white shadow-lg backdrop-blur-md sm:text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-300" />
            </span>
            SIAP UNTUK BELAJAR?
          </div>

          <h1 className="hero-heading text-[clamp(2.7rem,5.5vw,5.3rem)] font-black leading-[0.96] tracking-tight">
            JELAJAHI
            <span className="mt-2 block bg-gradient-to-r from-yellow-200 via-yellow-300 to-orange-300 bg-clip-text text-transparent [filter:drop-shadow(0_5px_0_rgba(120,65,15,0.2))]">
              FENOMENA ALAM!
            </span>
          </h1>

          <p className="hero-copy mx-auto mt-5 max-w-md text-base font-medium leading-7 text-white/90 sm:text-lg md:mx-0">
            Mengapa bumi berguncang? Bagaimana hujan terjadi? Temukan jawaban
            dari berbagai fenomena alam melalui petualangan belajar yang seru
          </p>

          <button
            type="button"
            onClick={() => router.push("/categories")}
            className="start-glow group relative mt-7 inline-flex min-h-16 w-full max-w-[340px] items-center justify-center gap-3 overflow-hidden rounded-[22px] border-b-[6px] border-orange-500 bg-gradient-to-b from-yellow-200 via-yellow-300 to-amber-400 px-5 py-4 text-base font-black text-sky-950 shadow-[0_12px_35px_rgba(255,190,40,0.3)] transition duration-300 hover:-translate-y-1 hover:brightness-110 active:translate-y-1 active:border-b-2 sm:w-auto sm:min-w-[290px] sm:text-lg"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/70 shadow-inner">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
            <span className="relative">MULAI PETUALANGAN</span>
            <ArrowRight className="relative h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>

          <p className="mt-4 text-xs font-semibold text-white/80">
            ✦ Belajar seru, bereksplorasi tanpa batas! ✦
          </p>
        </div>

        {/* Ilustrasi astronaut */}
        <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center">
          <div className="mascot-scene relative aspect-square w-full">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/35 blur-[65px]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[73%] w-[73%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

            <div className="orbit absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-50/55" />
            <div className="orbit absolute left-1/2 top-1/2 h-[64%] w-[94%] -translate-x-1/2 -translate-y-1/2 rotate-[-32deg] rounded-[50%] border-2 border-white/20" />

            <div className="planet planet-one left-[10%] top-[19%] h-[70px] w-[70px] sm:h-[90px] sm:w-[90px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200 via-fuchsia-400 to-violet-700 shadow-[inset_-12px_-10px_20px_rgba(40,10,100,.35),0_0_35px_rgba(222,120,255,.4)]" />
              <div className="absolute left-2 top-5 h-3 w-10 rotate-[-25deg] rounded-full bg-white/35 blur-[2px]" />
              <div className="absolute -right-2 top-6 h-5 w-5 rounded-full border-4 border-pink-200/70" />
            </div>

            <div className="planet planet-two bottom-[16%] right-[10%] h-[65px] w-[65px] sm:h-[84px] sm:w-[84px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-200 via-orange-400 to-rose-600 shadow-[inset_-10px_-12px_18px_rgba(120,30,30,.3),0_0_30px_rgba(255,160,100,.3)]" />
              <div className="absolute left-2 top-5 h-2 w-8 rotate-[-25deg] rounded-full bg-yellow-100/60" />
              <div className="absolute bottom-4 left-4 h-3 w-3 rounded-full bg-red-200/50" />
            </div>

            <Sparkles className="sparkle absolute right-[13%] top-[12%] h-10 w-10" />
            <Star className="sparkle absolute bottom-[20%] left-[12%] h-7 w-7 fill-current" />
            <Star className="absolute right-[18%] top-[40%] h-5 w-5 fill-white text-white" />

            <div
              className="space-mascot absolute left-1/2 top-1/2 z-10 w-[76%]"
              style={{ translate: "-50% -50%" }}
            >
              <svg
                viewBox="0 0 420 440"
                className="relative z-10 w-full overflow-visible"
                role="img"
                aria-label="Maskot astronaut SEMESTA"
              >
                <defs>
                  <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="55%" stopColor="#dcefff" />
                    <stop offset="100%" stopColor="#83c9f8" />
                  </linearGradient>
                  <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7ef4ff" />
                    <stop offset="50%" stopColor="#20b8ed" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="visor" x1="0" y1="0" x2="0.9" y2="1">
                    <stop offset="0%" stopColor="#244b85" />
                    <stop offset="45%" stopColor="#10254e" />
                    <stop offset="100%" stopColor="#081329" />
                  </linearGradient>
                  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fff5a6" />
                    <stop offset="100%" stopColor="#ffb52e" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g className="thruster">
                  <rect x="274" y="211" width="65" height="112" rx="25" fill="#1c4b91" stroke="#a9f5ff" strokeWidth="5" />
                  <rect x="286" y="224" width="42" height="72" rx="16" fill="url(#blue)" />
                  <rect x="295" y="235" width="24" height="5" rx="2.5" fill="#e5fdff" opacity=".9" />
                  <path d="M291 307 Q307 328 323 307 L318 353 Q307 371 296 353Z" fill="#2ee5ff" opacity=".9" filter="url(#glow)" />
                  <path d="M299 312 L307 342 L315 312Z" fill="#fff6b2" />
                </g>

                <g>
                  <path d="M151 304 Q143 338 155 365 L192 378 Q209 372 201 350 L199 307Z" fill="url(#suit)" stroke="#83c6ef" strokeWidth="4" />
                  <path d="M219 307 L218 350 Q211 370 231 379 L271 365 Q281 341 263 305Z" fill="url(#suit)" stroke="#83c6ef" strokeWidth="4" />
                  <path d="M151 355 Q171 366 199 358 L208 384 Q207 403 188 408 L148 401 Q133 391 143 372Z" fill="#e8f7ff" stroke="#8cccf1" strokeWidth="4" />
                  <path d="M221 358 Q246 367 272 352 L285 373 Q291 393 273 402 L234 409 Q214 403 213 386Z" fill="#e8f7ff" stroke="#8cccf1" strokeWidth="4" />
                  <path d="M146 387 Q172 398 201 386 M222 386 Q250 398 281 381" fill="none" stroke="#25bdec" strokeWidth="9" strokeLinecap="round" />
                  <path d="M157 399 L186 403 M238 402 L268 396" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                </g>

                <path d="M141 205 Q151 183 177 183 L246 183 Q272 187 281 211 L290 290 Q290 320 264 330 L160 330 Q132 321 134 294Z" fill="url(#suit)" stroke="#9bd7fa" strokeWidth="5" />
                <path d="M149 218 Q165 202 183 207 L179 303 Q162 312 146 297Z" fill="#b8e7ff" opacity=".8" />
                <path d="M259 213 Q277 231 276 280 L263 302 L250 215Z" fill="#fff" opacity=".9" />
                <path d="M177 198 L245 198 L253 214 L169 214Z" fill="url(#blue)" />
                <rect x="177" y="235" width="70" height="60" rx="16" fill="#d1eaff" stroke="#8ccdf2" strokeWidth="3" />
                <rect x="186" y="243" width="52" height="42" rx="11" fill="#173f73" />
                <path d="M194 257 L203 265 L194 273 M211 273 L220 257" stroke="#6cf2ff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M205 219 L214 207 L223 219 L214 231Z" fill="url(#gold)" stroke="#fff4a8" strokeWidth="2" />

                <g className="astronaut-wave">
                  <path d="M148 218 Q126 212 112 188 L91 153 Q83 138 96 129 Q110 123 120 141 L147 169 Q164 189 168 207Z" fill="url(#suit)" stroke="#92d2f7" strokeWidth="5" />
                  <path d="M105 153 L128 177" stroke="#26b9eb" strokeWidth="10" strokeLinecap="round" />
                  <path d="M90 135 Q76 121 82 103 Q85 95 91 102 L98 115 L98 93 Q99 83 106 90 L111 111 L116 97 Q122 90 126 101 L126 122 Q122 141 108 145Z" fill="#eaf8ff" stroke="#91d1f5" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M87 119 L91 132 M102 108 L103 124 M117 111 L116 124" stroke="#2bbbe9" strokeWidth="3" strokeLinecap="round" />
                </g>

                <path d="M272 216 Q297 217 310 239 L329 268 Q335 283 320 292 Q307 296 298 280 L277 259 L263 240Z" fill="url(#suit)" stroke="#92d2f7" strokeWidth="5" />
                <path d="M302 263 L318 279" stroke="#26b9eb" strokeWidth="10" strokeLinecap="round" />
                <path d="M314 281 Q306 271 315 263 L332 249 Q341 244 344 253 Q348 260 338 268 L327 283 Q320 289 314 281Z" fill="#eaf8ff" stroke="#91d1f5" strokeWidth="4" />

                <path d="M104 148 Q83 115 97 76 Q117 28 181 24 Q253 19 293 66 Q319 98 298 148 L281 180 Q253 204 201 204 Q144 203 119 177Z" fill="url(#suit)" stroke="#a4d9fa" strokeWidth="6" />
                <path d="M104 125 Q91 83 123 55 Q153 27 198 32 Q246 34 276 61 Q300 85 290 125 L280 149 Q253 170 200 171 Q148 169 119 149Z" fill="url(#visor)" stroke="#20c9f4" strokeWidth="4" />
                <path d="M113 118 Q101 78 137 55 Q160 39 191 40 Q150 61 145 103 Q139 133 161 164 Q129 156 113 118Z" fill="#fff" opacity=".16" />
                <path d="M274 75 Q292 104 274 133" fill="none" stroke="#a7f7ff" strokeWidth="5" strokeLinecap="round" opacity=".8" />
                <path d="M132 66 Q153 47 175 46" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".7" />

                <g>
                  <ellipse cx="165" cy="112" rx="8" ry="12" fill="#fff" />
                  <ellipse cx="166" cy="114" rx="4" ry="7" fill="#142b51" />
                  <circle cx="167" cy="111" r="2.2" fill="#fff" />
                  <ellipse cx="232" cy="112" rx="8" ry="12" fill="#fff" />
                  <ellipse cx="231" cy="114" rx="4" ry="7" fill="#142b51" />
                  <circle cx="232" cy="111" r="2.2" fill="#fff" />
                  <ellipse cx="148" cy="129" rx="10" ry="5" fill="#ff9ec7" opacity=".65" />
                  <ellipse cx="249" cy="129" rx="10" ry="5" fill="#ff9ec7" opacity=".65" />
                  <path d="M184 128 Q199 144 216 127" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                </g>

                <rect x="92" y="102" width="14" height="43" rx="7" fill="#c5eeff" stroke="#fff" strokeWidth="3" />
                <rect x="291" y="102" width="14" height="43" rx="7" fill="#c5eeff" stroke="#fff" strokeWidth="3" />
                <circle cx="99" cy="123" r="4" fill="#25bdec" />
                <circle cx="298" cy="123" r="4" fill="#25bdec" />
              </svg>
            </div>

            <div className="float-item absolute left-[2%] top-[45%] z-20 rounded-2xl border border-white/40 bg-white/20 p-3 shadow-xl backdrop-blur-xl sm:p-4">
              <Telescope className="h-6 w-6 text-yellow-200 sm:h-8 sm:w-8" />
            </div>

            <div className="float-item absolute right-[2%] top-[54%] z-20 rounded-2xl border border-white/40 bg-white/20 p-3 shadow-xl backdrop-blur-xl sm:p-4">
              <Atom className="h-6 w-6 text-cyan-100 sm:h-8 sm:w-8" />
            </div>

            <div className="absolute left-[4%] top-[8%] z-20 rounded-2xl border border-white/30 bg-white/20 px-3 py-2 shadow-xl backdrop-blur-xl sm:left-[7%] sm:px-4 sm:py-3">
              <p className="text-[9px] font-extrabold tracking-widest text-cyan-50/80 sm:text-[10px]">
                LEVEL
              </p>
              <p className="text-sm font-black sm:text-lg">
                01 <span className="text-yellow-200">★</span>
              </p>
            </div>

            <div className="absolute bottom-[6%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-2xl border border-white/35 bg-gradient-to-r from-white/25 to-cyan-100/15 px-3 py-2.5 shadow-2xl backdrop-blur-xl sm:px-5 sm:py-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-yellow-200 to-orange-400 text-sky-950 shadow-lg">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black sm:text-sm">PENJELAJAH CILIK</p>
                <p className="text-[10px] font-semibold text-white/75 sm:text-xs">
                  Petualangan dimulai di sini!
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-yellow-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 z-10 hidden text-center text-[10px] font-bold tracking-[0.28em] text-white/60 md:block">
        BERANI BERTANYA <span className="mx-2 text-yellow-200">✦</span> SERU
        MENJELAJAH <span className="mx-2 text-yellow-200">✦</span> HEBAT
        MENEMUKAN
      </div>

      {/* Modal informasi */}
      <SemestaInfoModal
        open={showInfo}
        onClose={() => setShowInfo(false)}
      />

      <style jsx>{`
        .mascot-scene {
          isolation: isolate;
        }

        .space-mascot {
          filter: drop-shadow(0 18px 20px rgba(12, 77, 170, 0.2));
          animation: mascot-hover 4s ease-in-out infinite;
          will-change: transform;
        }

        .planet-one {
          animation: planet-hover 5s ease-in-out infinite;
        }

        .planet-two {
          animation: planet-hover 6s ease-in-out infinite reverse;
        }

        .orbit {
          animation: orbit-turn 36s linear infinite;
        }

        .float-item {
          animation: item-hover 3.5s ease-in-out infinite;
        }

        .thruster {
          animation: thruster-glow 1.4s ease-in-out infinite alternate;
        }

        .astronaut-wave {
          transform-box: fill-box;
          transform-origin: 88% 92%;
          animation: wave-hello 3s ease-in-out infinite;
        }

        @keyframes mascot-hover {
          0%,
          100% {
            transform: translateY(0) rotate(-1.5deg);
          }
          50% {
            transform: translateY(-12px) rotate(1.5deg);
          }
        }

        @keyframes planet-hover {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -12px;
          }
        }

        @keyframes orbit-turn {
          from {
            rotate: 0deg;
          }
          to {
            rotate: 360deg;
          }
        }

        @keyframes item-hover {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -10px;
          }
        }

        @keyframes wave-hello {
          0%,
          100% {
            rotate: 0deg;
          }
          50% {
            rotate: -7deg;
          }
        }

        @keyframes thruster-glow {
          from {
            opacity: 0.7;
            filter: drop-shadow(0 0 2px #22d3ee);
          }
          to {
            opacity: 1;
            filter: drop-shadow(0 0 10px #22d3ee);
          }
        }

        @media (max-width: 767px) {
          .mascot-scene {
            width: min(100%, 420px);
          }

          .space-mascot {
            width: 73%;
          }
        }

        @media (max-height: 700px) and (min-width: 768px) {
          .mascot-scene {
            max-width: 440px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .space-mascot,
          .planet-one,
          .planet-two,
          .orbit,
          .float-item,
          .thruster,
          .astronaut-wave {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}