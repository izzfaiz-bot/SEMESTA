// components/quiz/setup/QuizSetupHeader.tsx
"use client";

import { ArrowLeft, Sparkles } from "lucide-react";

type QuizSetupHeaderProps = {
  step: 1 | 2 | 3;
  nickname?: string;
  onBack: () => void;
  loading?: boolean;
};

const steps = [
  { number: 1, label: "Nama", emoji: "🚀" },
  { number: 2, label: "Pengaturan", emoji: "⭐" },
  { number: 3, label: "Mulai Quiz", emoji: "🎯" },
] as const;

const titles = [
  "Siapa Nama Penjelajah?",
  "Siapkan Misi Sainsmu!",
  "Siap Memulai Petualangan?",
];

const descriptions = [
  "Kenalan dulu, yuk! Masukkan namamu untuk memulai petualangan sains.",
  "Pilih level kesulitan, jumlah soal, dan waktu untuk tantanganmu.",
  "Periksa kembali ringkasan misi dan bersiaplah menaklukkan tantangan sains!",
];

export default function QuizSetupHeader({
  step,
  nickname,
  onBack,
  loading = false,
}: QuizSetupHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-100 via-white to-cyan-100 px-4 py-2 shadow-[0_8px_24px_rgba(14,165,233,0.10)] sm:px-5 sm:py-2.5">
      {/* Dekorasi animasi */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-7 -top-10 -z-10 size-24 animate-pulse rounded-full bg-cyan-300/40 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -left-6 -z-10 size-20 animate-pulse rounded-full bg-sky-300/40 blur-xl [animation-delay:700ms]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[24%] top-2 animate-[spin_8s_linear_infinite] text-sky-500/60"
      >
        <Sparkles size={15} />
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 right-5 animate-pulse text-amber-400"
      >
        ✦
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[43%] top-3 size-1 rounded-full bg-sky-400/70 animate-ping"
      />

      {/* Navigasi */}
      <div className="relative flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="group inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-sky-200 bg-white/90 px-3 text-sm font-extrabold text-[#075985] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft
            size={16}
            strokeWidth={2.7}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          Kembali
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-white/80 px-3 py-1.5 text-[10px] font-black tracking-[0.08em] text-[#075985] shadow-sm transition-all duration-300 hover:border-cyan-400 hover:bg-white sm:text-xs">
          <Sparkles size={12} className="animate-pulse text-amber-400" />
          MISI PETUALANGAN SAINS
        </div>
      </div>

      {/* Judul */}
      <div
        key={step}
        className="relative mt-1.5 text-center animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <div className="flex items-center justify-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block text-2xl transition-transform duration-300 hover:scale-110"
          >
            {steps[step - 1].emoji}
          </span>
          <h1 className="text-xl font-black leading-tight tracking-tight text-[#083B66] sm:text-2xl">
            {titles[step - 1]}
          </h1>
        </div>

        <p className="mx-auto mt-1 max-w-2xl text-sm font-medium leading-snug text-[#164E75]">
          {descriptions[step - 1]}
          {nickname && step > 1 && (
            <>
              {" "}
              Semangat,{" "}
              <span className="font-extrabold text-sky-700">{nickname}</span>!
            </>
          )}
        </p>
      </div>

      {/* Stepper 1 → 2 → 3 */}
      <div className="relative mx-auto mt-2 flex max-w-[320px] items-start">
        {steps.map((item, index) => {
          const active = step === item.number;
          const completed = step > item.number;

          return (
            <div
              key={item.number}
              className={`relative flex flex-1 flex-col items-center ${
                index < steps.length - 1
                  ? `after:absolute after:left-1/2 after:top-4 after:h-0.5 after:w-full after:content-[''] ${
                      completed
                        ? "after:bg-sky-500"
                        : "after:bg-sky-200"
                    }`
                  : ""
              }`}
            >
              <div
                className={`relative z-10 grid size-8 place-items-center rounded-full border-2 text-sm font-black transition-all duration-300 ${
                  active
                    ? "scale-110 border-sky-600 bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_3px_12px_rgba(14,165,233,0.35)]"
                    : completed
                      ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                      : "border-sky-200 bg-white text-[#075985]"
                }`}
              >
                {active && (
                  <span className="absolute inset-[-4px] -z-10 animate-ping rounded-full bg-sky-300/40" />
                )}
                {completed ? "✓" : item.number}
              </div>

              <span
                className={`relative z-10 mt-1 text-sm font-extrabold leading-tight transition-colors duration-300 ${
                  active || completed
                    ? "text-[#083B66]"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </header>
  );
}