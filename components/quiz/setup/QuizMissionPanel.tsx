// components/quiz/QuizMissionPanel.tsx
"use client";

import { ArrowRight } from "lucide-react";
import QuizDifficultyPanel from "./QuizDifficultyPanel";
import QuizOptionsPanel from "./QuizOptionsPanel";
import type { Difficulty } from "@/modules/quiz/types/quiz.types";

type QuizMissionPanelProps = {
  difficulty: Difficulty;
  questionCount: number;
  secondsPerQuestion: number;
  loading: boolean;
  error?: string;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onQuestionCountChange: (count: number) => void;
  onTimeChange: (seconds: number) => void;
  onContinue: () => void;
};

export default function QuizMissionPanel({
  difficulty,
  questionCount,
  secondsPerQuestion,
  loading,
  error,
  onDifficultyChange,
  onQuestionCountChange,
  onTimeChange,
  onContinue,
}: QuizMissionPanelProps) {
  return (
    <section className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
      {/* Dekorasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-8 top-10 size-28 rounded-full bg-sky-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-8 size-28 rounded-full bg-indigo-200/30 blur-3xl"
      />

      {/* Konten utama dipusatkan */}
      <div className="relative mx-auto my-auto w-full max-w-5xl shrink-0">
        {/* Dua panel */}
        <div className="grid w-full grid-cols-2 items-stretch gap-2.5 sm:gap-4 lg:gap-5">
          {/* KIRI: Level kesulitan */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-sky-100 bg-white/90 shadow-sm transition-shadow duration-300 hover:shadow-md sm:rounded-3xl">
            <QuizDifficultyPanel
              difficulty={difficulty}
              onChange={onDifficultyChange}
              loading={loading}
            />
          </div>

          {/* KANAN: Pengaturan kuis */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-sky-100 bg-white/90 shadow-sm transition-shadow duration-300 hover:shadow-md sm:rounded-3xl">
            <QuizOptionsPanel
              difficulty={difficulty}
              questionCount={questionCount}
              secondsPerQuestion={secondsPerQuestion}
              loading={loading}
              error={error}
              onQuestionCountChange={onQuestionCountChange}
              onTimeChange={onTimeChange}
            />
          </div>
        </div>

        {/* Tombol selebar kedua panel */}
        <div className="mt-4 w-full sm:mt-5">
          <button
            type="button"
            onClick={onContinue}
            disabled={loading}
            className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-4 py-3 text-xs font-black tracking-wide text-white shadow-lg shadow-blue-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-300/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:min-h-12 sm:rounded-2xl sm:text-sm"
          >
            <span>LANJUT KE RINGKASAN</span>
            <ArrowRight
              size={17}
              className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </section>
  );
}