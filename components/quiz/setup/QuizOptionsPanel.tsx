// components/quiz/QuizOptionsPanel.tsx
"use client";

import { Check, Clock3, Layers3, Sparkles } from "lucide-react";
import type { Difficulty } from "@/modules/quiz/types/quiz.types";

type QuizOptionsPanelProps = {
  difficulty: Difficulty;
  questionCount: number;
  secondsPerQuestion: number;
  loading: boolean;
  error?: string;
  onQuestionCountChange: (count: number) => void;
  onTimeChange: (seconds: number) => void;
};

const questionOptions = [10, 20, 25];
const timeOptions = [30, 45, 60, 90];

const themes = {
  violet: {
    border: "from-violet-300 via-purple-400 to-fuchsia-300",
    gradient: "from-violet-50 via-white to-fuchsia-50",
    badge: "bg-violet-100 text-violet-700",
    check: "border-violet-500 bg-violet-500",
    glow: "bg-violet-300/40",
    focus: "focus-visible:ring-violet-200",
  },
  sky: {
    border: "from-sky-300 via-cyan-400 to-blue-400",
    gradient: "from-sky-50 via-white to-cyan-50",
    badge: "bg-sky-100 text-sky-700",
    check: "border-sky-500 bg-sky-500",
    glow: "bg-sky-300/40",
    focus: "focus-visible:ring-sky-200",
  },
};

type OptionButtonProps = {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  theme: typeof themes.violet;
  children: React.ReactNode;
  className: string;
  label: string;
};

function OptionButton({
  active,
  disabled,
  onClick,
  theme,
  children,
  className,
  label,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`group relative isolate flex min-w-0 overflow-hidden rounded-xl p-[2px] text-left transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 ${theme.focus} disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? "shadow-md" : "shadow-sm"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-xl bg-slate-200 transition-opacity duration-300 ${
          active ? "opacity-0" : "opacity-100 group-hover:opacity-0"
        }`}
      />

      <span
        aria-hidden="true"
        className={`absolute -inset-[100%] rounded-full bg-gradient-to-r ${theme.border} transition-opacity duration-300 ${
          active
            ? "animate-[spin_4s_linear_infinite] opacity-100"
            : "opacity-0 group-hover:animate-[spin_4s_linear_infinite] group-hover:opacity-100"
        }`}
      />

      <span
        className={`relative flex h-full w-full min-w-0 items-center justify-center overflow-hidden rounded-[10px] transition-colors duration-300 ${
          active ? `bg-gradient-to-br ${theme.gradient}` : "bg-white group-hover:bg-white/95"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -right-4 -top-4 size-10 rounded-full opacity-0 blur-xl transition-opacity duration-300 ${theme.glow} ${
            active ? "opacity-100" : "group-hover:opacity-100"
          }`}
        />

        {children}

        <span
          className={`absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full border transition-all duration-300 ${
            active
              ? `${theme.check} scale-100 text-white`
              : "scale-90 border-slate-200 bg-white text-transparent group-hover:scale-100"
          }`}
        >
          <Check size={10} strokeWidth={3} />
        </span>
      </span>
    </button>
  );
}

export default function QuizOptionsPanel({
  questionCount,
  secondsPerQuestion,
  loading,
  error,
  onQuestionCountChange,
  onTimeChange,
}: QuizOptionsPanelProps) {
  return (
    <section className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[7%] top-10 size-12 rounded-full bg-violet-200/30 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-[8%] size-16 rounded-full bg-sky-200/30 blur-2xl"
      />

      <div className="relative flex w-full min-w-0 flex-1 flex-col">
        <div className="mb-4 flex items-center gap-2.5 sm:gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-sky-100 text-violet-700 sm:size-10">
            <SlidersIcon />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black tracking-tight text-[#083B66] sm:text-lg">
              Jumlah Soal
            </h2>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-600 sm:text-xs">
              Pilih jumlah tantangan.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          <div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {questionOptions.map((count, index) => {
                const active = questionCount === count;

                return (
                  <OptionButton
                    key={count}
                    active={active}
                    disabled={loading}
                    onClick={() => onQuestionCountChange(count)}
                    theme={themes.violet}
                    label={`${count} soal`}
                    className="h-[76px] animate-[fadeInUp_450ms_ease-out_both] sm:h-[76px]"
                  >
                    <span className="relative flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-[#083B66] sm:text-xl">
                        {count}
                      </span>
                      <span className="mt-0.5 text-[9px] font-bold text-slate-500 sm:text-[10px]">
                        soal
                      </span>
                    </span>
                  </OptionButton>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2.5 sm:gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700 sm:size-10">
            <Clock3 />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black tracking-tight text-[#083B66] sm:text-lg">
              Waktu per Soal
            </h2>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-600 sm:text-xs">
              Atur batas waktu menjawab.
            </p>
          </div>
        </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {timeOptions.map((seconds) => {
                const active = secondsPerQuestion === seconds;

                return (
                  <OptionButton
                    key={seconds}
                    active={active}
                    disabled={loading}
                    onClick={() => onTimeChange(seconds)}
                    theme={themes.sky}
                    label={`${seconds} detik per soal`}
                    className="h-11 animate-[fadeInUp_450ms_ease-out_both] sm:h-14"
                  >
                    <span className="relative flex items-center justify-center gap-1.5 px-2">
                      <span className="text-sm font-black text-[#083B66]">
                        {seconds}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        detik
                      </span>
                    </span>
                  </OptionButton>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700"
          >
            {error}
          </div>
        )}
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

function SlidersIcon() {
  return <Layers3 size={20} />;
}