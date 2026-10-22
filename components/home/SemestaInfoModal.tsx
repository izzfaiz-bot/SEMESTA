// components/home/SemestaInfoModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  GraduationCap,
  PlayCircle,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";

interface SemestaInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const PEOPLE = [
  {
    role: "PENGEMBANG",
    name: "Andrian Rizki A",
    detail: "Mahasiswa UMP · Teknik Informatika 2023",
    instagram: "@andrian.aminudin",
    url: "https://www.instagram.com/andrian.aminudin/",
    email: "andrian.aminudin@gmail.com",
    initials: "AR",
    gradient: "from-blue-500 via-cyan-500 to-sky-400",
    accent: "text-sky-600",
    soft: "bg-sky-50",
    delay: "180ms",
  },
  {
    role: "PEMATERI",
    name: "Faiz Afif Naufal",
    detail: "Mahasiswa UMP · PGSD 2024",
    instagram: "@faizaajj_",
    url: "https://www.instagram.com/faizaajj_/",
    email: "faizafifn@gmail.com",
    initials: "FA",
    gradient: "from-violet-500 via-indigo-500 to-blue-500",
    accent: "text-violet-600",
    soft: "bg-violet-50",
    delay: "300ms",
  },
];

const STARS = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  delay: `${(i % 7) * 0.35}s`,
  duration: `${2 + (i % 4) * 0.6}s`,
  size: i % 4 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
}));

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="instagram-gradient" x1="3" y1="21" x2="21" y2="3">
          <stop offset="0%" stopColor="#FCAF45" />
          <stop offset="50%" stopColor="#F77737" />
          <stop offset="100%" stopColor="#E1306C" />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="url(#instagram-gradient)"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="url(#instagram-gradient)"
        strokeWidth="1.8"
      />
      <circle cx="17.5" cy="6.8" r="1.1" fill="#F77737" />
    </svg>
  );
}

function EmailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SemestaInfoModal({
  open,
  onClose,
}: SemestaInfoModalProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!open) {
      setClosing(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      onClose();
      setClosing(false);
    }, 220);
  };

  if (!open) return null;

  return (
    <div
      className={`semesta-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#06132d]/75 p-3 backdrop-blur-md sm:p-6 ${
        closing ? "semesta-overlay-out" : ""
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="semesta-glow semesta-glow-one absolute -left-32 -top-32 h-80 w-80 rounded-full bg-sky-500/25 blur-[100px]" />
        <div className="semesta-glow semesta-glow-two absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet-500/20 blur-[110px]" />

        {STARS.map((star, index) => (
          <span
            key={index}
            className="semesta-star absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}

        <div className="semesta-bg-orbit absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/[0.12] sm:h-[700px] sm:w-[700px]" />
        <div className="semesta-bg-orbit semesta-bg-orbit-two absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/[0.12] sm:h-[530px] sm:w-[530px]" />
      </div>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="semesta-modal-title"
        className={`semesta-dialog relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_100px_-25px_rgba(14,165,233,0.45)] sm:rounded-[32px] ${
          closing ? "semesta-dialog-out" : ""
        }`}
      >
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0879ed] via-[#168bfa] to-[#55d5f8] px-4 pb-4 pt-4 text-white sm:px-8 sm:pb-4 sm:pt-4">
          <div className="pointer-events-none absolute inset-0">
            <div className="semesta-header-shine absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="semesta-header-orbit absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/20" />
            <div className="semesta-header-orbit semesta-header-orbit-two absolute -right-3 -top-16 h-48 w-48 rounded-full border border-white/15" />
            <div className="absolute -right-3 bottom-0 h-28 w-28 rounded-full bg-cyan-200/20 blur-2xl" />
            <div className="semesta-float absolute right-24 top-10 text-white/70">
              <Sparkles size={17} />
            </div>
            <span className="semesta-twinkle absolute right-16 top-24 h-2 w-2 rounded-full bg-white" />
            <span className="semesta-twinkle absolute right-40 top-14 h-1.5 w-1.5 rounded-full bg-cyan-100 [animation-delay:0.6s]" />
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup informasi SEMESTA"
            className="group absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition duration-300 hover:rotate-90 hover:scale-110 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:top-5"
          >
            <X size={18} />
          </button>

          <div className="relative z-[1] flex items-center gap-4">
            <div className="semesta-logo-wrap relative flex h-[68px] w-[68px] shrink-0 items-center justify-center sm:h-[78px] sm:w-[78px]">
              <div className="semesta-logo-orbit absolute inset-0 rounded-full border border-dashed border-white/70" />
              <div className="absolute inset-[7px] rounded-full bg-white/20 shadow-inner backdrop-blur-sm" />
              <div className="relative flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-white shadow-lg sm:h-[62px] sm:w-[62px]">
                <img
                  src="/logo-semesta.jpeg"
                  alt="Logo SEMESTA"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <span className="semesta-orbit-dot absolute -right-0.5 top-3 h-3 w-3 rounded-full border-2 border-white bg-yellow-300 shadow-md" />
            </div>

            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
              </div>
              <h2
                id="semesta-modal-title"
                className="text-2xl font-black tracking-tight drop-shadow-sm sm:text-3xl"
              >
                Tentang SEMESTA
              </h2>
              <p className="mt-1 text-xs font-medium text-white/85 sm:text-sm">
                Kenali dunia di balik petualanganmu!
              </p>
            </div>
          </div>
        </header>

        <div className="semesta-content min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
          <section className="semesta-section">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 sm:text-base">
                  Apa itu SEMESTA?
                </h3>
                <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
                  Belajar sambil berpetualang
                </p>
              </div>
            </div>

            <p className="text-[12px] leading-6 text-slate-600 sm:text-[13px] sm:leading-7">
              <strong className="font-extrabold text-sky-700">SEMESTA</strong>{" "}
              adalah media pembelajaran IPAS interaktif yang mengajak siswa
              menjelajahi berbagai fenomena alam melalui materi digital, video
              edukatif, kuis, dan pengalaman belajar yang menyenangkan.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                {
                  icon: <PlayCircle size={17} />,
                  title: "Video",
                  subtitle: "Visual menarik",
                  color: "bg-sky-50 text-sky-600",
                  delay: "100ms",
                },
                {
                  icon: <Code2 size={17} />,
                  title: "Materi",
                  subtitle: "Mudah dipahami",
                  color: "bg-violet-50 text-violet-600",
                  delay: "180ms",
                },
                {
                  icon: <Sparkles size={17} />,
                  title: "Kuis",
                  subtitle: "Uji pengetahuan",
                  color: "bg-amber-50 text-amber-600",
                  delay: "260ms",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{ animationDelay: item.delay }}
                  className={`semesta-feature-card rounded-2xl border border-slate-100 p-3 text-center transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/60 ${item.color}`}
                >
                  <div className="mb-2 flex justify-center">{item.icon}</div>
                  <p className="text-xs font-extrabold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                    {item.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="semesta-section mt-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <GraduationCap size={19} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 sm:text-base">
                  Tim Pengembang
                </h3>
                <p className="text-[10px] text-slate-400 sm:text-xs">
                  Orang-orang di balik petualangan ini
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PEOPLE.map((person) => (
                <article
                  key={person.name}
                  style={{ animationDelay: person.delay }}
                  className="semesta-person group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_12px_32px_-16px_rgba(14,165,233,0.4)]"
                >
                  <div
                    className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${person.soft} opacity-70 blur-2xl transition duration-500 group-hover:scale-150`}
                  />

                  <div className="relative flex items-center gap-3">
                    <div
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${person.gradient} text-sm font-black text-white shadow-lg transition duration-300 group-hover:rotate-3 group-hover:scale-105`}
                    >
                      {person.initials}
                      <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`inline-flex rounded-md ${person.soft} px-2 py-1 text-[8px] font-extrabold tracking-[0.15em] ${person.accent}`}
                      >
                        {person.role}
                      </span>
                      <h4 className="mt-1.5 text-sm font-extrabold leading-tight text-slate-800">
                        {person.name}
                      </h4>
                    </div>
                  </div>

                  <p className="relative mt-3 min-h-[34px] text-[10px] leading-5 text-slate-500 sm:text-[11px]">
                    {person.detail}
                  </p>

                  <div className="relative mt-3 space-y-2">
                    <a
                      href={person.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex min-w-0 items-center gap-2 rounded-xl bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-600 transition duration-300 hover:bg-orange-100 hover:shadow-md hover:shadow-orange-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    >
                      <InstagramIcon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/link:rotate-[-8deg] group-hover/link:scale-110" />
                      <span className="min-w-0 flex-1 truncate">
                        {person.instagram}
                      </span>
                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-orange-500 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                      />
                    </a>

                    <a
                      href={`mailto:${person.email}`}
                      className="group/email flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600 transition duration-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      <EmailIcon className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover/email:scale-110" />
                      <span className="min-w-0 flex-1 truncate">
                        {person.email}
                      </span>
                      <ExternalLink
                        size={12}
                        className="shrink-0 text-slate-400"
                      />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="semesta-section mt-7">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                <Code2 size={18} />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 sm:text-base">
                  Dibangun dengan Teknologi
                </h3>
                <p className="text-[10px] text-slate-400 sm:text-xs">
                  Teknologi di balik pengalaman belajar
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Next.js", "TypeScript", "Tailwind CSS"].map((tech, index) => (
                <span
                  key={tech}
                  style={{ animationDelay: `${index * 100 + 100}ms` }}
                  className="semesta-tech inline-flex items-center gap-2 rounded-full border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 px-3.5 py-2 text-[11px] font-bold text-sky-700 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 sm:text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </div>

        <footer className="relative shrink-0 border-t border-slate-100 bg-white px-4 py-3.5 sm:px-7 sm:py-4">
          <button
            type="button"
            onClick={handleClose}
            className="semesta-cta group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0879ed] via-[#168bfa] to-[#35bdf4] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-sky-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-300/60 active:translate-y-0 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          >
            <span className="semesta-cta-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <Rocket
              size={17}
              className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
            <span className="relative">Mulai Menjelajah!</span>
            <ArrowUpRight
              size={16}
              className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>
          <p className="mt-2 text-center text-[9px] font-medium tracking-wide text-slate-400">
            SEMESTA · Belajar, Bereksplorasi, dan Menemukan
          </p>
        </footer>
      </section>

      <style jsx>{`
        .semesta-overlay {
          animation: semesta-overlay-in 260ms ease-out both;
        }

        .semesta-dialog {
          animation: semesta-dialog-in 480ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
          transform-origin: center;
          will-change: transform, opacity;
        }

        .semesta-overlay-out {
          animation: semesta-overlay-out 220ms ease-in both;
        }

        .semesta-dialog-out {
          animation: semesta-dialog-out 220ms ease-in both;
        }

        .semesta-logo-wrap {
          animation: semesta-logo-entrance 700ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .semesta-logo-orbit {
          animation: semesta-orbit 12s linear infinite;
        }

        .semesta-orbit-dot {
          animation: semesta-dot-pulse 2s ease-in-out infinite;
        }

        .semesta-star {
          opacity: 0.3;
          animation: semesta-twinkle ease-in-out infinite;
        }

        .semesta-glow {
          animation: semesta-glow-drift 9s ease-in-out infinite alternate;
        }

        .semesta-glow-two {
          animation-delay: -4s;
        }

        .semesta-bg-orbit {
          animation: semesta-orbit 65s linear infinite;
        }

        .semesta-bg-orbit-two {
          animation-direction: reverse;
          animation-duration: 48s;
        }

        .semesta-header-orbit {
          animation: semesta-orbit 30s linear infinite;
        }

        .semesta-header-orbit-two {
          animation-direction: reverse;
          animation-duration: 22s;
        }

        .semesta-header-shine {
          animation: semesta-header-shine 7s ease-in-out infinite;
        }

        .semesta-float {
          animation: semesta-float 3s ease-in-out infinite;
        }

        .semesta-twinkle {
          animation: semesta-twinkle 2.4s ease-in-out infinite;
        }

        .semesta-section {
          animation: semesta-section-in 650ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .semesta-feature-card {
          animation: semesta-section-in 600ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .semesta-person {
          animation: semesta-person-in 650ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .semesta-tech {
          animation: semesta-section-in 550ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .semesta-cta-icon {
          animation: semesta-rocket-float 3s ease-in-out infinite;
        }

        .semesta-cta-sparkle {
          animation: semesta-float 2.4s ease-in-out infinite;
        }

        .semesta-cta-shine {
          animation: semesta-button-shine 4s ease-in-out infinite;
        }

        @keyframes semesta-overlay-in {
          from {
            opacity: 0;
            backdrop-filter: blur(0);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }

        @keyframes semesta-overlay-out {
          to {
            opacity: 0;
            backdrop-filter: blur(0);
          }
        }

        @keyframes semesta-dialog-in {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.94);
            filter: blur(5px);
          }
          65% {
            opacity: 1;
            transform: translateY(-3px) scale(1.005);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes semesta-dialog-out {
          to {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
            filter: blur(3px);
          }
        }

        @keyframes semesta-logo-entrance {
          0% {
            opacity: 0;
            transform: scale(0.65) rotate(-18deg);
          }
          75% {
            opacity: 1;
            transform: scale(1.07) rotate(4deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes semesta-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes semesta-dot-pulse {
          0%,
          100% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(253, 224, 71, 0.35);
          }
          50% {
            transform: scale(1.15);
            box-shadow: 0 0 0 5px rgba(253, 224, 71, 0);
          }
        }

        @keyframes semesta-twinkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.75);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        @keyframes semesta-glow-drift {
          0% {
            transform: translate3d(-8px, 0, 0) scale(0.95);
          }
          100% {
            transform: translate3d(24px, 20px, 0) scale(1.12);
          }
        }

        @keyframes semesta-header-shine {
          0%,
          20% {
            transform: translateX(-30%);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          65%,
          100% {
            transform: translateX(330%);
            opacity: 0;
          }
        }

        @keyframes semesta-float {
          0%,
          100% {
            transform: translateY(0) rotate(-4deg);
          }
          50% {
            transform: translateY(-7px) rotate(5deg);
          }
        }

        @keyframes semesta-section-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes semesta-person-in {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          70% {
            opacity: 1;
            transform: translateY(-2px) scale(1.005);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes semesta-rocket-float {
          0%,
          100% {
            transform: translateY(0) rotate(-4deg);
          }
          50% {
            transform: translateY(-3px) rotate(4deg);
          }
        }

        @keyframes semesta-button-shine {
          0%,
          55% {
            transform: translateX(-150%);
          }
          85%,
          100% {
            transform: translateX(450%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .semesta-overlay,
          .semesta-dialog,
          .semesta-overlay-out,
          .semesta-dialog-out,
          .semesta-logo-wrap,
          .semesta-logo-orbit,
          .semesta-orbit-dot,
          .semesta-star,
          .semesta-glow,
          .semesta-bg-orbit,
          .semesta-header-orbit,
          .semesta-header-shine,
          .semesta-float,
          .semesta-twinkle,
          .semesta-section,
          .semesta-feature-card,
          .semesta-person,
          .semesta-tech,
          .semesta-cta-icon,
          .semesta-cta-sparkle,
          .semesta-cta-shine {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}