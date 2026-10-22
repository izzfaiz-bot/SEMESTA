// app/phenomena/[slug]/quiz/result/[attemptId]/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  LoaderCircle,
  Medal,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  X,
  Zap,
} from "lucide-react";

type ResultQuestion = {
  id: string;
  position: number;
  text: string;
  explanation: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  isCorrect: boolean;
  selectedOptionText: string | null;
  correctOptionText: string | null;
  pointsEarned: number;
  responseTimeMs: number | null;
};

type QuizResult = {
  id: string;
  nickname: string | null;
  score: number;
  totalPoints: number;
  percentage: number;
  correctCount: number;
  questionCount: number;
  status: string;
  completedAt: string | null;
  phenomenon: { title: string; slug: string } | null;
  questions: ResultQuestion[];
};

const difficultyLabels: Record<ResultQuestion["difficulty"], string> = {
  EASY: "Mudah",
  MEDIUM: "Menengah",
  HARD: "Menantang",
};

function formatDuration(milliseconds: number | null) {
  if (milliseconds === null || !Number.isFinite(milliseconds)) return "-";
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function getAchievement(percentage: number) {
  if (percentage >= 90)
    return {
      title: "LUAR BIASA!",
      subtitle: "Kamu adalah bintang sains!",
      label: "PENJELAJAH AHLI",
      message: "Misi diselesaikan dengan gemilang!",
      color: "from-yellow-300 via-amber-400 to-orange-400",
    };

  if (percentage >= 75)
    return {
      title: "HEBAT SEKALI!",
      subtitle: "Kemampuan sainsmu makin hebat!",
      label: "PENJELAJAH HEBAT",
      message: "Kamu berhasil melewati tantangan!",
      color: "from-cyan-300 via-sky-400 to-blue-500",
    };

  if (percentage >= 60)
    return {
      title: "KEREN BANGET!",
      subtitle: "Terus asah rasa ingin tahumu!",
      label: "PENJELAJAH MUDA",
      message: "Satu langkah lagi menuju ahli sains!",
      color: "from-violet-300 via-purple-400 to-indigo-500",
    };

  return {
    title: "MISI SELESAI!",
    subtitle: "Setiap jawaban adalah pengalaman!",
    label: "PENJELAJAH PEMULA",
    message: "Terus mencoba, temukan hal baru!",
    color: "from-emerald-300 via-teal-400 to-cyan-500",
  };
}

export default function QuizResultPage() {
  const router = useRouter();
  const params = useParams<{ slug: string; attemptId: string }>();
  const slug = params.slug;
  const attemptId = params.attemptId;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const loadResult = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/quiz/attempts/${encodeURIComponent(attemptId)}`,
        { cache: "no-store" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat hasil kuis.");
      }

      const questions: ResultQuestion[] = Array.isArray(data.questions)
        ? data.questions.map((question: Record<string, unknown>) => ({
            id: String(question.id ?? ""),
            position: Number(question.position ?? 0),
            text: String(question.text ?? ""),
            explanation:
              typeof question.explanation === "string"
                ? question.explanation
                : null,
            difficulty: (question.difficulty ?? "EASY") as ResultQuestion["difficulty"],
            points: Number(question.points ?? 0),
            isCorrect: question.isCorrect === true,
            selectedOptionText:
              typeof question.selectedOptionText === "string"
                ? question.selectedOptionText
                : null,
            correctOptionText:
              typeof question.correctOptionText === "string"
                ? question.correctOptionText
                : null,
            pointsEarned: Number(question.pointsEarned ?? 0),
            responseTimeMs:
              typeof question.responseTimeMs === "number"
                ? question.responseTimeMs
                : null,
          }))
        : [];

      setResult({
        id: String(data.id ?? attemptId),
        nickname: data.nickname ?? null,
        score: Number(data.score ?? 0),
        totalPoints: Number(data.totalPoints ?? 0),
        percentage: Math.min(100, Math.max(0, Number(data.percentage ?? 0))),
        correctCount: Number(data.correctCount ?? 0),
        questionCount: Number(data.questionCount ?? questions.length),
        status: String(data.status ?? ""),
        completedAt: data.completedAt ?? null,
        phenomenon: data.phenomenon ?? null,
        questions: questions.sort((a, b) => a.position - b.position),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat hasil kuis.");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    void loadResult();
  }, [loadResult]);

  const goToPhenomenon = () => {
    router.replace(`/phenomena/${encodeURIComponent(slug)}`);
  };

  const retryQuiz = () => {
    router.replace(`/phenomena/${encodeURIComponent(slug)}/quiz`);
  };

  const currentQuestion = result?.questions[reviewIndex];
  const achievement = getAchievement(result?.percentage ?? 0);

  if (loading) {
    return (
      <main className="flex h-[100svh] items-center justify-center overflow-hidden bg-[#eaf7ff] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-xl shadow-blue-200">
            <Trophy size={36} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute -right-2 -top-2 text-amber-400"
            >
              <Sparkles size={25} />
            </motion.div>
          </div>
          <p className="font-black text-slate-700">Menyiapkan hasil petualangan...</p>
          <LoaderCircle className="animate-spin text-sky-500" size={24} />
        </motion.div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex h-[100svh] items-center justify-center overflow-hidden bg-[#eaf7ff] p-4">
        <div className="w-full max-w-md rounded-[2rem] border border-white bg-white p-7 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-500">
            <X size={32} />
          </div>
          <h1 className="text-xl font-black text-slate-800">Oops, ada kendala!</h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "Hasil petualangan belum dapat ditampilkan."}
          </p>
          <button
            onClick={() => void loadResult()}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 font-bold text-white transition hover:bg-sky-600"
          >
            <RotateCcw size={17} />
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-[100svh] overflow-hidden bg-[#eaf7ff] text-slate-800">
      <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-violet-300/30 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 16 }, (_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0
                ? "h-2 w-2 bg-amber-300"
                : i % 3 === 1
                  ? "h-1.5 w-1.5 bg-sky-400"
                  : "h-1 w-1 bg-violet-400"
            }`}
            style={{
              left: `${(i * 37 + 9) % 100}%`,
              top: `${(i * 23 + 7) % 100}%`,
            }}
            animate={{ y: [0, -10, 0], opacity: [0.35, 1, 0.35] }}
            transition={{
              duration: 2 + (i % 4),
              repeat: Infinity,
              delay: i * 0.12,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col p-2.5 sm:p-4">
        <AnimatePresence mode="wait">
          {!showReview ? (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.3 }}
              className="flex min-h-0 flex-1 items-center justify-center"
            >
              <div className="relative grid max-h-[720px] min-h-0 w-full grid-cols-1 overflow-hidden rounded-[1.7rem] border-4 border-white bg-white shadow-[0_20px_70px_-25px_rgba(37,99,235,0.3)] sm:rounded-[2.2rem] md:grid-cols-[0.95fr_1.05fr]">
                <div className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#138ff5] via-[#3674f5] to-[#6559ed] px-5 py-5 text-center text-white sm:px-8">
                  <div className="absolute -left-12 -top-16 h-44 w-44 rounded-full border-[22px] border-white/10" />
                  <div className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full border-[26px] border-white/10" />
                  <div className="absolute left-[18%] top-[16%] text-yellow-300">
                    <Star size={17} fill="currentColor" />
                  </div>
                  <div className="absolute right-[17%] top-[25%] text-cyan-200">
                    <Sparkles size={22} />
                  </div>
                  <div className="absolute bottom-[19%] left-[13%] text-yellow-200">
                    <Sparkles size={19} />
                  </div>

                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative mb-3 flex h-24 w-24 items-center justify-center rounded-[2rem] border-4 border-white/70 bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400 text-white shadow-[0_12px_0_rgba(30,64,175,0.2)] sm:h-28 sm:w-28"
                  >
                    <Trophy
                      size={54}
                      strokeWidth={2.3}
                      className="drop-shadow-md"
                    />
                    <motion.div
                      animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white bg-pink-400 text-white shadow-lg"
                    >
                      <Star size={20} fill="currentColor" />
                    </motion.div>
                  </motion.div>

                  <span className="rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-cyan-50 sm:text-xs">
                    MISI SELESAI
                  </span>

                  <h1 className="mt-3 text-3xl font-black leading-none tracking-tight drop-shadow-sm sm:text-4xl">
                    {achievement.title}
                  </h1>
                  <p className="mt-2 max-w-xs text-xs font-semibold text-blue-50 sm:text-sm">
                    {achievement.subtitle}
                  </p>

                  <div className="mt-4 rounded-2xl border border-white/25 bg-white/15 px-4 py-2 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Medal size={17} className="text-yellow-300" />
                      <span className="text-[10px] font-black tracking-[0.14em] sm:text-xs">
                        {achievement.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-blue-100 sm:text-xs">
                    <Sparkles size={14} />
                    {achievement.message}
                  </div>
                </div>

                <div className="flex min-h-0 flex-col justify-center p-4 sm:p-6 md:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-sky-500 sm:text-xs">
                        <Zap size={14} fill="currentColor" />
                        HASIL PETUALANGAN
                      </div>
                      <h2 className="mt-1 truncate text-lg font-black text-slate-800 sm:text-2xl">
                        {result.phenomenon?.title || "Tantangan Sains"}
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        Penjelajah{" "}
                        <span className="font-extrabold text-slate-600">
                          {result.nickname?.trim() || "Sahabat Sains"}
                        </span>
                      </p>
                    </div>
                    <div className="shrink-0 rounded-2xl bg-amber-50 p-3 text-amber-500">
                      <Award size={25} />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-3.5 text-white shadow-lg shadow-blue-200/70 sm:p-4">
                      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                      <p className="relative text-[10px] font-bold text-blue-100 sm:text-xs">
                        SKOR PETUALANGAN
                      </p>
                      <div className="relative mt-1 flex items-baseline gap-1">
                        <span className="text-4xl font-black tracking-tight sm:text-5xl">
                          {Math.round(result.percentage)}
                        </span>
                        <span className="text-lg font-extrabold text-blue-100">%</span>
                      </div>
                      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-blue-950/25">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full rounded-full bg-gradient-to-r from-yellow-200 to-amber-300"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl border-2 border-emerald-100 bg-emerald-50/80 p-3.5 sm:p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <Check size={19} strokeWidth={3} />
                      </div>
                      <div className="mt-2">
                        <p className="text-[10px] font-bold text-emerald-700 sm:text-xs">
                          JAWABAN BENAR
                        </p>
                        <p className="mt-0.5 text-2xl font-black text-emerald-700 sm:text-3xl">
                          {result.correctCount}
                          <span className="ml-1 text-sm font-bold text-emerald-500">
                            / {result.questionCount}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <Star size={21} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-700 sm:text-sm">
                          Bintang terkumpul
                        </p>
                        <p className="text-[10px] text-slate-400 sm:text-xs">
                          Hasil dari jawabanmu
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-violet-600">
                      {result.score}
                      <span className="ml-1 text-xs font-bold text-violet-400">poin</span>
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        setReviewIndex(0);
                        setShowReview(true);
                      }}
                      className="group col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#168cf4] to-[#5367f4] px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 sm:py-4"
                    >
                      <BookOpen size={19} />
                      Lihat Pembahasan
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                    <button
                      onClick={goToPhenomenon}
                      className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-100 bg-white px-3 py-3 text-xs font-extrabold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 sm:text-sm"
                    >
                      <Home size={16} />
                      Kembali ke Fenomena
                    </button>
                    <button
                      onClick={retryQuiz}
                      className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-amber-100 bg-amber-50 px-3 py-3 text-xs font-extrabold text-amber-700 transition hover:bg-amber-100 sm:text-sm"
                    >
                      <RotateCcw size={16} />
                      Ulangi Petualangan
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="review"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              transition={{ duration: 0.25 }}
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.7rem] border-4 border-white bg-white/95 shadow-[0_20px_70px_-25px_rgba(37,99,235,0.3)] sm:rounded-[2.2rem]"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-4 py-3 text-white sm:px-6">
                <button
                  onClick={() => setShowReview(false)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold transition hover:bg-white/25 sm:text-sm"
                >
                  <ArrowLeft size={17} />
                  Hasil
                </button>
                <div className="min-w-0 text-center">
                  <h2 className="truncate text-sm font-black sm:text-lg">
                    Ruang Pembahasan
                  </h2>
                  <p className="text-[10px] text-blue-100 sm:text-xs">
                    Pelajari setiap jawabanmu
                  </p>
                </div>
                <div className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-xs font-black">
                  {result.questions.length > 0 ? reviewIndex + 1 : 0}
                  <span className="mx-1 text-blue-200">/</span>
                  {result.questions.length}
                </div>
              </div>

              {currentQuestion ? (
                <>
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-black text-sky-700 sm:text-xs">
                        SOAL {reviewIndex + 1}
                      </span>
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold text-violet-700">
                        {difficultyLabels[currentQuestion.difficulty] || "Mudah"}
                      </span>
                      <span
                        className={`ml-auto flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black sm:text-xs ${
                          currentQuestion.isCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {currentQuestion.isCorrect ? (
                          <Check size={13} />
                        ) : (
                          <X size={13} />
                        )}
                        {currentQuestion.isCorrect ? "BENAR" : "BELUM TEPAT"}
                      </span>
                    </div>

                    <div className="rounded-2xl border-2 border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5">
                      <h3 className="text-sm font-extrabold leading-relaxed text-slate-800 sm:text-lg">
                        {currentQuestion.text}
                      </h3>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div
                        className={`rounded-2xl border-2 p-3 ${
                          currentQuestion.isCorrect
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-rose-200 bg-rose-50"
                        }`}
                      >
                        <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Jawabanmu
                        </p>
                        <div className="flex items-start gap-2">
                          {currentQuestion.isCorrect ? (
                            <Check
                              size={17}
                              className="mt-0.5 shrink-0 text-emerald-600"
                            />
                          ) : (
                            <X size={17} className="mt-0.5 shrink-0 text-rose-500" />
                          )}
                          <p className="text-xs font-bold leading-relaxed text-slate-700 sm:text-sm">
                            {currentQuestion.selectedOptionText || "Tidak dijawab"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3">
                        <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                          Jawaban yang benar
                        </p>
                        <div className="flex items-start gap-2">
                          <Check
                            size={17}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          <p className="text-xs font-bold leading-relaxed text-slate-700 sm:text-sm">
                            {currentQuestion.correctOptionText || "Belum tersedia"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
                      <div className="mb-1.5 flex items-center gap-2 text-amber-700">
                        <Sparkles size={17} />
                        <p className="text-xs font-black sm:text-sm">
                          Yuk, pahami alasannya!
                        </p>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                        {currentQuestion.explanation ||
                          "Belum ada penjelasan untuk soal ini."}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 sm:text-xs">
                        <Star size={14} className="text-amber-500" />
                        Poin diperoleh: {currentQuestion.pointsEarned}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 sm:text-xs">
                        <Clock3 size={14} className="text-sky-500" />
                        Waktu menjawab: {formatDuration(currentQuestion.responseTimeMs)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-3 py-3 sm:px-5">
                    <button
                      onClick={() => setReviewIndex((index) => Math.max(0, index - 1))}
                      disabled={reviewIndex === 0}
                      className="flex items-center gap-1.5 rounded-xl border-2 border-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 sm:text-sm"
                    >
                      <ChevronLeft size={18} />
                      Sebelumnya
                    </button>

                    {reviewIndex < result.questions.length - 1 ? (
                      <button
                        onClick={() =>
                          setReviewIndex((index) =>
                            Math.min(result.questions.length - 1, index + 1),
                          )
                        }
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-blue-100 transition hover:brightness-105 sm:text-sm"
                      >
                        Berikutnya
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowReview(false)}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-100 transition hover:brightness-105 sm:text-sm"
                      >
                        Selesai
                        <Check size={17} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-5 text-center">
                  <div className="mb-4 rounded-3xl bg-sky-100 p-5 text-sky-500">
                    <BookOpen size={36} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    Belum ada pembahasan
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Soal untuk petualangan ini belum tersedia.
                  </p>
                  <button
                    onClick={() => setShowReview(false)}
                    className="mt-4 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white"
                  >
                    Kembali ke Hasil
                  </button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}