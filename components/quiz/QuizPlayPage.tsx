// components/quiz/QuizPlayPage.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  LockKeyhole,
  LoaderCircle,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";

type QuizOption = { id: string; text: string };

type QuizQuestion = {
  id: string;
  position: number;
  text: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  timeLimitSeconds: number;
  questionStartedAt?: string | null;
  answered: boolean;
  isCorrect: boolean | null;
  timedOut: boolean;
  pointsEarned: number;
  options: QuizOption[];
};

type QuizData = {
  attemptId: string;
  nickname: string | null;
  phenomenon: { title: string; slug: string } | null;
  startedAt: string;
  questionCount: number;
  questions: QuizQuestion[];
};

type ActiveQuestion = QuizQuestion & {
  questionStartedAt: string;
  remainingSeconds: number;
};

type QuizPlayPageProps = { attemptId: string };

const PAGE_SIZE = 10;
const optionLetters = ["A", "B", "C", "D", "E", "F"];

const difficultyLabels: Record<QuizQuestion["difficulty"], string> = {
  EASY: "Mudah",
  MEDIUM: "Menengah",
  HARD: "Menantang",
};

export default function QuizPlayPage({ attemptId }: QuizPlayPageProps) {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [questionPage, setQuestionPage] = useState(0);

  const submittingRef = useRef(false);
  const openingRef = useRef(false);
  const exitingRef = useRef(false);

  const loadQuiz = useCallback(async () => {
    if (!attemptId) {
      setError("ID percobaan kuis tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/quiz/attempts/${encodeURIComponent(attemptId)}/play`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat soal kuis.");
      }

      const rawQuestions = Array.isArray(data.questions) ? data.questions : [];

      if (!rawQuestions.length) {
        throw new Error("Belum ada soal yang tersedia untuk kuis ini.");
      }

      const questions: QuizQuestion[] = rawQuestions.map(
        (question: Record<string, unknown>) => {
          const options = Array.isArray(question.options)
            ? (question.options as QuizOption[])
            : [];

          return {
            id: String(question.id),
            position: Number(question.position),
            text: String(question.text ?? ""),
            difficulty: question.difficulty as QuizQuestion["difficulty"],
            points: Number(question.points ?? 0),
            timeLimitSeconds: Number(question.timeLimitSeconds ?? 30),
            questionStartedAt:
              typeof question.questionStartedAt === "string"
                ? question.questionStartedAt
                : null,
            answered: question.answered === true,
            isCorrect:
              typeof question.isCorrect === "boolean"
                ? question.isCorrect
                : null,
            timedOut: question.timedOut === true,
            pointsEarned: Number(question.pointsEarned ?? 0),
            options,
          };
        },
      );

      setQuiz({
        attemptId: data.attemptId,
        nickname: data.nickname ?? null,
        phenomenon: data.phenomenon ?? null,
        startedAt: data.startedAt,
        questionCount: data.questionCount ?? questions.length,
        questions,
      });

      setActiveQuestion(null);
      setSelectedOption("");
      setTimeLeft(0);
      setQuestionPage(0);
      setActionError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat kuis.",
      );
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  const totalQuestions = quiz?.questions.length ?? 0;
  const answeredCount =
    quiz?.questions.filter((question) => question.answered).length ?? 0;
  const allCompleted = totalQuestions > 0 && answeredCount === totalQuestions;
  const progress = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0;
  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE);
  const pageQuestions =
    quiz?.questions.slice(
      questionPage * PAGE_SIZE,
      questionPage * PAGE_SIZE + PAGE_SIZE,
    ) ?? [];

  const submitAnswer = useCallback(
    async (optionId?: string) => {
      if (!quiz || !activeQuestion || submittingRef.current) return;

      const questionId = activeQuestion.id;

      submittingRef.current = true;
      setSaving(true);
      setActionError("");

      try {
        const response = await fetch(
          `/api/quiz/attempts/${encodeURIComponent(quiz.attemptId)}/questions/${encodeURIComponent(questionId)}/answer`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              optionId ? { selectedOptionId: optionId } : {},
            ),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal menyimpan jawaban.");
        }

        const timedOut = data.expired === true || !optionId;
        const isCorrect = !timedOut && data.isCorrect === true;

        setQuiz((previous) => {
          if (!previous) return previous;

          return {
            ...previous,
            questions: previous.questions.map((question) =>
              question.id === questionId
                ? {
                    ...question,
                    answered: true,
                    isCorrect,
                    timedOut,
                    pointsEarned: Number(data.pointsEarned ?? 0),
                  }
                : question,
            ),
          };
        });

        setActiveQuestion(null);
        setSelectedOption("");
        setTimeLeft(0);

        if (data.completed) {
          router.replace(
            `/phenomena/${encodeURIComponent(slug)}/quiz/result/${encodeURIComponent(quiz.attemptId)}`,
          );
        }
      } catch (err) {
        setActionError(
          err instanceof Error
            ? err.message
            : "Jawaban gagal disimpan. Silakan coba lagi.",
        );
      } finally {
        submittingRef.current = false;
        setSaving(false);
      }
    },
    [activeQuestion, quiz, router],
  );

  const openQuestion = async (question: QuizQuestion) => {
    if (
      !quiz ||
      question.answered ||
      openingRef.current ||
      submittingRef.current
    ) {
      return;
    }

    openingRef.current = true;
    setOpening(true);
    setActionError("");

    try {
      const response = await fetch(
        `/api/quiz/attempts/${encodeURIComponent(quiz.attemptId)}/questions/${encodeURIComponent(question.id)}`,
        { method: "POST", cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) await loadQuiz();
        throw new Error(data.error || "Gagal membuka soal.");
      }

      const questionData = data.question;
      const startedAt =
        data.questionStartedAt ??
        questionData?.questionStartedAt ??
        question.questionStartedAt;

      if (!startedAt) {
        throw new Error("Waktu mulai soal tidak ditemukan.");
      }

      const limitSeconds = Number(
        questionData?.timeLimitSeconds ?? question.timeLimitSeconds,
      );

      const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
      );

      const remainingSeconds = data.expired
        ? 0
        : Math.max(0, limitSeconds - elapsedSeconds);

      const openedQuestion: ActiveQuestion = {
        ...question,
        id: questionData?.id ?? question.id,
        position: questionData?.position ?? question.position,
        text: questionData?.text ?? question.text,
        difficulty: questionData?.difficulty ?? question.difficulty,
        points: questionData?.points ?? question.points,
        timeLimitSeconds: limitSeconds,
        questionStartedAt: startedAt,
        remainingSeconds,
        options: questionData?.options ?? question.options,
      };

      setActiveQuestion(openedQuestion);
      setSelectedOption("");
      setTimeLeft(remainingSeconds);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal membuka soal.",
      );
    } finally {
      openingRef.current = false;
      setOpening(false);
    }
  };

  // Hitung waktu berdasarkan jam mulai dari server, bukan sekadar mengurangi state.
  useEffect(() => {
    if (!activeQuestion || saving) return;

    const updateTimer = () => {
      const startedAt = new Date(activeQuestion.questionStartedAt).getTime();

      if (!Number.isFinite(startedAt)) {
        setTimeLeft(0);
        return;
      }

      const deadline = startedAt + activeQuestion.timeLimitSeconds * 1000;
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

      setTimeLeft(remaining);
    };

    updateTimer();

    const timer = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(timer);
  }, [activeQuestion, saving]);

  // Waktu habis: simpan jawaban kosong sebagai timeout.
  useEffect(() => {
    if (!activeQuestion || timeLeft > 0 || saving) return;
    void submitAnswer();
  }, [activeQuestion, timeLeft, saving, submitAnswer]);

  const handleExit = async () => {
    if (!quiz || exitingRef.current) return;

    exitingRef.current = true;
    setExiting(true);
    setActionError("");

    try {
      const response = await fetch(
        `/api/quiz/attempts/${encodeURIComponent(quiz.attemptId)}`,
        { method: "DELETE" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal keluar dari kuis.");
      }

      router.replace(`/phenomena/${encodeURIComponent(slug)}`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal keluar dari kuis.",
      );
      exitingRef.current = false;
      setExiting(false);
      setShowExitConfirm(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-100 px-5">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200">
            <LoaderCircle className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-black text-slate-800">
            Menyiapkan Petualangan...
          </h2>
          <p className="text-sm text-slate-500">
            Astronaut SEMESTA sedang menyiapkan soalmu.
          </p>
        </div>
      </main>
    );
  }

  if (error || !quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-100 px-5">
        <div className="w-full max-w-md rounded-[2rem] border border-white bg-white p-8 text-center shadow-xl shadow-blue-100/70">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">
            Kuis Belum Bisa Dibuka
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => void loadQuiz()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              <Rocket className="h-4 w-4" /> Coba Lagi
            </button>
            <button
              onClick={() =>
                router.push(`/phenomena/${encodeURIComponent(slug)}`)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-[100svh] overflow-hidden bg-[#f4f9ff] text-slate-800">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <AnimatePresence mode="wait">
          {!activeQuestion ? (
            <motion.section
              key="question-map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex min-h-0 flex-1 flex-col rounded-[1.5rem] border border-white bg-white/95 p-3 shadow-xl shadow-blue-100/60 sm:rounded-[1.75rem] sm:p-5">
                <div className="shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(true)}
                      disabled={exiting}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                      <X className="h-4 w-4" /> Keluar
                    </button>

                    <div className="min-w-0 flex-1 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500 sm:text-xs">
                        Misi Penjelajah
                      </p>
                      <h1 className="truncate text-sm font-black text-slate-800 sm:text-lg">
                        {quiz.phenomenon?.title || "Kuis Sains"}
                      </h1>
                      <p className="truncate text-[10px] font-semibold text-slate-400 sm:text-xs">
                        Penjelajah: {quiz.nickname || "Astronaut"}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl bg-blue-50 px-2.5 py-1.5 text-right sm:px-3 sm:py-2">
                      <p className="text-[9px] font-bold uppercase text-blue-400 sm:text-[10px]">
                        Selesai
                      </p>
                      <p className="text-xs font-black text-blue-700 sm:text-sm">
                        {answeredCount}
                        <span className="font-semibold text-blue-300">
                          {" "}
                          / {totalQuestions}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 sm:mt-3 sm:h-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>

                  <div className="mt-2 text-center sm:mt-3">
                    <h2 className="text-lg font-black text-slate-800 sm:text-2xl">
                      {allCompleted
                        ? "Petualangan Selesai!"
                        : "Pilih Nomor Soal"}
                    </h2>
                    <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                      {allCompleted
                        ? "Hebat! Kamu telah menyelesaikan semua tantangan sains."
                        : "Pilih angka untuk membuka soal. Soal yang selesai akan terkunci."}
                    </p>
                  </div>
                </div>

                {actionError && (
                  <div className="mt-2 shrink-0 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                    {actionError}
                  </div>
                )}

                {allCompleted ? (
                  <div className="flex flex-1 items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        router.replace(
                          `/quiz/result/${encodeURIComponent(quiz.attemptId)}`,
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-extrabold text-white shadow-lg shadow-blue-200 transition hover:scale-[1.02] sm:px-7 sm:py-4"
                    >
                      <Rocket className="h-5 w-5" /> Lihat Hasil Petualangan
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-5 grid-rows-2 gap-3 py-3 sm:gap-4 sm:py-4">
                      {pageQuestions.map((question, pageIndex) => {
                        const index = questionPage * PAGE_SIZE + pageIndex;
                        const isAnswered = question.answered;
                        const isTimedOut = question.timedOut;
                        const isBusy = opening && !isAnswered;

                        return (
                          <motion.button
                            key={question.id}
                            type="button"
                            whileHover={
                              !isAnswered ? { scale: 1.035 } : undefined
                            }
                            whileTap={
                              !isAnswered ? { scale: 0.96 } : undefined
                            }
                            disabled={
                              isAnswered || opening || saving || exiting
                            }
                            onClick={() => void openQuestion(question)}
                            aria-label={
  !isAnswered
    ? `Buka soal ${index + 1}`
    : isTimedOut
      ? `Soal ${index + 1}, waktu habis`
      : `Soal ${index + 1}, sudah dijawab`
}
                            className={`relative flex min-h-0 min-w-0 items-center justify-center rounded-2xl border-2 text-2xl font-black transition sm:rounded-2xl sm:text-4xl ${
  isTimedOut
    ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-600"
    : isAnswered
      ? "cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-600"
      : "border-blue-100 bg-gradient-to-br from-white to-sky-50 text-blue-700 shadow-sm hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100"
}`}
                          >
                            {isBusy ? (
  <LoaderCircle className="h-6 w-6 animate-spin sm:h-8 sm:w-8" />
) : isTimedOut ? (
  <X className="h-7 w-7 sm:h-9 sm:w-9" />
) : isAnswered ? (
  <Check className="h-7 w-7 sm:h-9 sm:w-9" />
) : (
  index + 1
)}

{isAnswered && (
  <LockKeyhole
    className={`absolute bottom-1 right-1 h-3 w-3 sm:bottom-2 sm:right-2 sm:h-4 sm:w-4 ${
      isTimedOut ? "text-rose-400" : "text-emerald-500"
    }`}
  />
)}
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setQuestionPage((page) => Math.max(0, page - 1))
                        }
                        disabled={questionPage === 0 || opening || saving}
                        className="inline-flex items-center gap-1 rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:invisible sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Sebelumnya
                      </button>

                      <span className="text-xs font-bold text-slate-400">
                        {questionPage + 1} / {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setQuestionPage((page) =>
                            Math.min(totalPages - 1, page + 1),
                          )
                        }
                        disabled={
                          questionPage >= totalPages - 1 || opening || saving
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-blue-100 transition hover:bg-blue-700 disabled:invisible sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                      >
                        Berikutnya
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex shrink-0 flex-wrap justify-center gap-x-3 gap-y-1.5 text-[9px] font-semibold text-slate-500 sm:mt-3 sm:gap-x-5 sm:text-xs">
  <div className="flex items-center gap-1.5">
    <span className="h-3 w-3 rounded border border-blue-200 bg-sky-50 sm:h-3.5 sm:w-3.5" />
    Belum dikerjakan
  </div>
  <div className="flex items-center gap-1.5">
    <span className="flex h-3 w-3 items-center justify-center rounded bg-emerald-100 text-emerald-600 sm:h-3.5 sm:w-3.5">
      <Check className="h-2.5 w-2.5" />
    </span>
    Sudah dijawab
  </div>
  <div className="flex items-center gap-1.5">
    <span className="flex h-3 w-3 items-center justify-center rounded bg-rose-100 text-rose-600 sm:h-3.5 sm:w-3.5">
      <X className="h-2.5 w-2.5" />
    </span>
    Waktu habis
  </div>
</div>
                  </>
                )}

                {opening && (
                  <p className="mt-2 flex shrink-0 items-center justify-center gap-2 text-xs font-semibold text-blue-600">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Membuka soal...
                  </p>
                )}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key={activeQuestion.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto py-2"
            >
              <div className="rounded-[1.75rem] border border-white bg-white p-4 shadow-xl shadow-blue-100/60 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-extrabold text-sky-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    SOAL {String(activeQuestion.position).padStart(2, "0")}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                      {difficultyLabels[activeQuestion.difficulty]}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${
                        timeLeft <= 5
                          ? "animate-pulse bg-rose-50 text-rose-600"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <Clock3 className="h-3.5 w-3.5" />
                      {`${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`}
                    </span>
                  </div>
                </div>

                <div className="mt-5 sm:mt-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Tantangan untukmu
                  </p>
                  <h2 className="mt-3 text-lg font-extrabold leading-relaxed text-slate-800 sm:text-2xl">
                    {activeQuestion.text}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Pilih satu jawaban yang paling tepat.
                  </p>
                </div>

                <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
                  {activeQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={saving || timeLeft <= 0}
                        onClick={() => setSelectedOption(option.id)}
                        aria-pressed={isSelected}
                        className={`group flex min-h-[62px] items-center gap-3 rounded-2xl border-2 p-3 text-left transition duration-200 sm:min-h-[76px] sm:p-4 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                            : "border-slate-100 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition sm:h-10 sm:w-10 ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            optionLetters[index] || index + 1
                          )}
                        </span>
                        <span
                          className={`flex-1 text-sm font-semibold leading-relaxed sm:text-base ${
                            isSelected ? "text-blue-800" : "text-slate-600"
                          }`}
                        >
                          {option.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {actionError && (
                  <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                    {actionError}
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
                  <p className="text-xs font-semibold text-slate-400">
                    {timeLeft <= 0
                      ? "Waktu habis, menyimpan hasil..."
                      : selectedOption
                        ? "Jawaban siap dikirim"
                        : "Pilih salah satu jawaban"}
                  </p>

                  <button
                    type="button"
                    disabled={!selectedOption || saving || timeLeft <= 0}
                    onClick={() => void submitAnswer(selectedOption)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {saving ? "Menyimpan..." : "Kunci Jawaban"}
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showExitConfirm && !activeQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-[1.75rem] bg-white p-6 shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <X className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-800">
                Keluar dari misi?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Percobaan kuis yang masih aktif akan dihapus. Kamu bisa memulai
                petualangan baru nanti.
              </p>

              {actionError && (
                <p className="mt-3 text-sm font-medium text-rose-600">
                  {actionError}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={exiting}
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Lanjut Kuis
                </button>
                <button
                  type="button"
                  disabled={exiting}
                  onClick={() => void handleExit()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-rose-600 disabled:opacity-50"
                >
                  {exiting && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  {exiting ? "Keluar..." : "Keluar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}