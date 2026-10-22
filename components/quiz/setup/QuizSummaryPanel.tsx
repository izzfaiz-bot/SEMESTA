// components/quiz/QuizSummaryPanel.tsx
"use client";

import { BookOpen, Clock3, Layers3, Rocket, Sparkles, Star, Zap } from "lucide-react";

type QuizSummaryPanelProps = {
  nickname: string;
  category: string;
  material: string;
  difficulty: string;
  questionCount: number;
  secondsPerQuestion: number;
  loading: boolean;
  onStart: () => void;
};

export default function QuizSummaryPanel({
  nickname,
  category,
  material,
  difficulty,
  questionCount,
  secondsPerQuestion,
  loading,
  onStart,
}: QuizSummaryPanelProps) {
  const parsedQuestionCount = Number(questionCount);
  const safeQuestionCount = Number.isFinite(parsedQuestionCount) ? Math.max(0, Math.floor(parsedQuestionCount)) : 0;
  const parsedSeconds = Number(secondsPerQuestion);
  const safeSecondsPerQuestion = Number.isFinite(parsedSeconds) ? Math.max(0, Math.floor(parsedSeconds)) : 0;

  const totalSeconds = safeQuestionCount * safeSecondsPerQuestion;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const duration = `${minutes} menit ${seconds} detik`;

  const normalizedDifficulty = difficulty.trim().toUpperCase();
  const difficultyLabel =
    normalizedDifficulty === "EASY" ? "Easy" :
    normalizedDifficulty === "MEDIUM" ? "Medium" :
    normalizedDifficulty === "HARD" ? "Hard" :
    normalizedDifficulty === "RANDOM" ? "Random" :
    difficulty || "Pemula";

  const difficultyStars =
    normalizedDifficulty === "EASY" ? "⭐" :
    normalizedDifficulty === "MEDIUM" ? "⭐⭐" :
    normalizedDifficulty === "HARD" ? "⭐⭐⭐" :
    "⭐⭐⭐⭐⭐";

  const cards = [
    {
      label: "Materi",
      value: material || "Materi Sains",
      description: `Kategori: ${category || "Sains"}`,
      icon: BookOpen,
      style: "from-sky-400 to-blue-600",
      glow: "group-hover:shadow-sky-100",
    },
    {
      label: "Level Misi",
      value: difficultyLabel,
      description: "Tingkat tantanganmu",
      icon: Layers3,
      style: "from-violet-400 to-indigo-600",
      glow: "group-hover:shadow-violet-100",
    },
    {
      label: "Jumlah Soal",
      value: `${safeQuestionCount} Soal`,
      description: "Tantangan menantimu",
      icon: Zap,
      style: "from-amber-400 to-orange-500",
      glow: "group-hover:shadow-amber-100",
    },
    {
      label: "Waktu Misi",
      value: `${safeSecondsPerQuestion} detik per soal`,
      description: duration,
      icon: Clock3,
      style: "from-emerald-400 to-teal-600",
      glow: "group-hover:shadow-emerald-100",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-[0_20px_60px_-25px_rgba(14,165,233,0.3)]">
      <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-sky-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 size-48 rounded-full bg-indigo-100/60 blur-3xl" />

      <div className="relative overflow-hidden bg-gradient-to-br from-[#e7f8ff] via-white to-[#eef0ff] p-5 sm:p-7">
        <Star aria-hidden="true" className="absolute right-8 top-5 animate-pulse fill-sky-300/40 text-sky-400" size={21} />
        <Star aria-hidden="true" className="absolute right-20 top-12 fill-indigo-300/50 text-indigo-400" size={13} />
        <Sparkles aria-hidden="true" className="absolute right-12 top-20 text-sky-300/70" size={18} />
        <span className="absolute right-28 top-7 size-1.5 rounded-full bg-sky-400" />
        <span className="absolute right-6 top-16 size-1.5 rounded-full bg-indigo-300" />
        <span className="absolute right-24 top-24 size-1 rounded-full bg-sky-400" />

        <div className="relative mb-1 flex flex-wrap items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-100">
            <Rocket size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black tracking-tight text-slate-800 sm:text-xl">
              {nickname.trim() || "Penjelajah"}, Siap Meluncur?
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Kenali misi, asah rasa ingin tahu, dan buktikan kemampuanmu menaklukkan tantangan sains!
            </p>
          </div>

          <button
            type="button"
            onClick={onStart}
            disabled={loading}
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-200/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-sm"
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Rocket size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            )}
            {loading ? "MENYIAPKAN..." : "MULAI KUIS"}
          </button>
        </div>
      </div>

      <div className="relative p-5 sm:p-7">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={15} className="text-sky-500" />
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            Detail Misi Kamu
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4">
          {cards.map((card) => {
  const Icon = card.icon;

  return (
    <div
      key={card.label}
      className={`group relative min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${card.glow}`}
    >
      <div
        className={`absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-gradient-to-br ${card.style} opacity-[0.07] transition group-hover:opacity-[0.13]`}
      />

      <div className="relative flex items-center gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.style} text-white shadow-md sm:size-16`}
        >
          <Icon size={28} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
            {card.label}
          </p>

          <p className="mt-1 break-words text-base font-black text-slate-800 sm:text-lg">
            {card.label === "Level Misi" ? difficultyLabel : card.value}
          </p>

          {card.label === "Level Misi" ? (
            <div className="flex flex-col items-start gap-1">
              <span
                className="text-md leading-relaxed tracking-wider"
                aria-label={`${difficultyLabel}: ${difficultyStars}`}
                title={`${difficultyLabel}: ${difficultyStars}`}
              >
                {difficultyStars}
              </span>
            </div>
          ) : (
            <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
              {card.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
})}
        </div>
      </div>
    </section>
  );
}