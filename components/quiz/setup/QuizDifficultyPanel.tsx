// components/quiz/QuizDifficultyPanel.tsx
"use client";

import { Check, Sparkles, Target } from "lucide-react";
import type { Difficulty } from "@/modules/quiz/types/quiz.types";

type QuizDifficultyPanelProps = {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  loading?: boolean;
};

const difficulties: {
  value: Difficulty;
  label: string;
  emoji: string;
  description: string;
  theme: {
    icon: string;
    border: string;
    gradient: string;
    badge: string;
    check: string;
    glow: string;
  };
}[] = [
  {
    value: "EASY",
    label: "Easy",
    emoji: "⭐",
    description: "Mudah · Mulai dari dasar",
    theme: {
      icon: "bg-emerald-100",
      border: "from-emerald-300 via-green-400 to-teal-300",
      gradient: "from-emerald-50 via-white to-teal-50",
      badge: "bg-emerald-100 text-emerald-700",
      check: "border-emerald-500 bg-emerald-500",
      glow: "bg-emerald-300/50",
    },
  },
  {
    value: "MEDIUM",
    label: "Medium",
    emoji: "⭐⭐",
    description: "Sedang · Uji kemampuanmu",
    theme: {
      icon: "bg-amber-100",
      border: "from-amber-300 via-yellow-400 to-orange-300",
      gradient: "from-amber-50 via-white to-yellow-50",
      badge: "bg-amber-100 text-amber-700",
      check: "border-amber-500 bg-amber-500",
      glow: "bg-amber-300/50",
    },
  },
  {
    value: "HARD",
    label: "Hard",
    emoji: "⭐⭐⭐",
    description: "Sulit · Tantangan tinggi",
    theme: {
      icon: "bg-rose-100",
      border: "from-rose-300 via-pink-400 to-orange-300",
      gradient: "from-rose-50 via-white to-pink-50",
      badge: "bg-rose-100 text-rose-700",
      check: "border-rose-500 bg-rose-500",
      glow: "bg-rose-300/50",
    },
  },
  {
    value: "RANDOM",
    label: "Random",
    emoji: "🎲",
    description: "Semua level",
    theme: {
      icon: "bg-violet-100",
      border: "from-violet-300 via-purple-400 to-fuchsia-300",
      gradient: "from-violet-50 via-white to-fuchsia-50",
      badge: "bg-violet-100 text-violet-700",
      check: "border-violet-500 bg-violet-500",
      glow: "bg-violet-300/50",
    },
  },
];

export default function QuizDifficultyPanel({
  difficulty,
  onChange,
  loading = false,
}: QuizDifficultyPanelProps) {
  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden p-3 sm:p-4">
      {/* Dekorasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[7%] top-10 size-12 rounded-full bg-sky-200/40 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-[8%] size-16 rounded-full bg-cyan-200/40 blur-2xl"
      />

      <div className="relative">
        {/* Judul */}
        <div className="mb-4 flex items-center gap-2.5 sm:gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-700 sm:size-10">
            <Target size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-black tracking-tight text-[#083B66] sm:text-lg">
              Pilih Level Petualangan
            </h2>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-600 sm:text-xs">
              Pilih tingkat tantangan sesuai kesiapanmu!
            </p>
          </div>
        </div>

        {/* Pilihan level */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {difficulties.map((item, index) => {
            const active = difficulty === item.value;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                disabled={loading}
                onClick={() => onChange(item.value)}
                style={{ animationDelay: `${index * 60}ms` }}
                className={`group relative isolate flex h-[104px] min-w-0 animate-[fadeInUp_450ms_ease-out_both] items-center gap-2 overflow-hidden rounded-xl p-[2px] text-left transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[112px] sm:gap-2.5 sm:rounded-2xl ${
                  active ? "shadow-lg" : "shadow-sm"
                }`}
              >
                {/* Border normal */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-xl bg-slate-200 transition-opacity duration-300 sm:rounded-2xl ${
                    active
                      ? "opacity-0"
                      : "opacity-100 group-hover:opacity-0"
                  }`}
                />

                {/* Border gradient animasi */}
                <span
                  aria-hidden="true"
                  className={`absolute -inset-[100%] rounded-full bg-gradient-to-r ${item.theme.border} transition-opacity duration-300 ${
                    active
                      ? "animate-[spin_4s_linear_infinite] opacity-100"
                      : "opacity-0 group-hover:animate-[spin_4s_linear_infinite] group-hover:opacity-100"
                  }`}
                />

                {/* Isi tombol */}
                <span
                  className={`relative flex h-full w-full min-w-0 items-center gap-2 overflow-hidden rounded-[10px] px-2 transition-colors duration-300 sm:gap-2.5 sm:rounded-[14px] sm:px-3 ${
                    active
                      ? `bg-gradient-to-br ${item.theme.gradient}`
                      : "bg-white group-hover:bg-white/95"
                  }`}
                >
                  {/* Efek glow */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -right-5 -top-5 size-14 rounded-full opacity-0 blur-xl transition-opacity duration-300 ${item.theme.glow} ${
                      active ? "opacity-100" : "group-hover:opacity-100"
                    }`}
                  />

                  {/* Ikon bintang atau dadu */}
                  <span
                    className={`relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105 sm:size-11 ${item.theme.icon}`}
                  >
                    {item.value === "HARD" ? (
                      <span className="flex flex-col items-center justify-center gap-0 text-[10px] leading-[9px] sm:text-xs sm:leading-[10px]">
                        <span>⭐</span>
                        <span>⭐⭐</span>
                      </span>
                    ) : item.value === "MEDIUM" ? (
                      <span className="whitespace-nowrap text-xs sm:text-sm">
                        ⭐⭐
                      </span>
                    ) : (
                      <span className="text-base sm:text-xl">{item.emoji}</span>
                    )}
                  </span>

                  {/* Informasi level */}
                  <span className="relative min-w-0 flex-1">
                    <span className="block truncate text-xs font-black text-[#083B66] sm:text-sm">
                      {item.label}
                    </span>

                    <span className="mt-1 block text-[9px] font-medium leading-snug text-slate-500 sm:text-[10px]">
                      {item.description}
                    </span>

                    {active && (
                      <span
                        className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold tracking-wide ${item.theme.badge}`}
                      >
                        <Sparkles size={9} />
                        DIPILIH
                      </span>
                    )}
                  </span>

                  {/* Indikator terpilih */}
                  <span
                    className={`relative flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      active
                        ? `${item.theme.check} scale-100 text-white`
                        : "scale-90 border-slate-200 bg-white text-transparent group-hover:scale-100"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          button,
          span {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}