// components/quiz/QuizPlayPage.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  LoaderCircle,
  Mail,
  MailOpen,
  Orbit,
  RotateCcw,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  X,
  Zap,
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

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } },
};

export default function QuizPlayPage({ attemptId }: QuizPlayPageProps) {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const reduceMotion = useReducedMotion();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [openingQuestionId, setOpeningQuestionId] = useState("");
  const [letterOpening, setLetterOpening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [questionPage, setQuestionPage] = useState(0);
  const [recentlyCompletedId, setRecentlyCompletedId] = useState("");

  const submittingRef = useRef(false);
  const openingRef = useRef(false);
  const exitingRef = useRef(false);
  const timeoutTriggeredRef = useRef(false);

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
        (question: Record<string, unknown>) => ({
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
            typeof question.isCorrect === "boolean" ? question.isCorrect : null,
          timedOut: question.timedOut === true,
          pointsEarned: Number(question.pointsEarned ?? 0),
          options: Array.isArray(question.options)
            ? (question.options as QuizOption[])
            : [],
        }),
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
      setOpeningQuestionId("");
      setLetterOpening(false);
      setTimeLeft(0);
      setQuestionPage(0);
      setRecentlyCompletedId("");
      setActionError("");
      timeoutTriggeredRef.current = false;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat kuis.",
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

      if (optionId && !activeQuestion.options.some((option) => option.id === optionId)) {
        return;
      }

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
            body: JSON.stringify(optionId ? { selectedOptionId: optionId } : {}),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal menyimpan jawaban.");
        }

        const timedOut = data.expired === true || !optionId;
        const completed = data.completed === true;
        const pointsEarned = Number(data.pointsEarned ?? 0);

        setQuiz((previous) => {
          if (!previous) return previous;

          return {
            ...previous,
            questions: previous.questions.map((question) =>
              question.id === questionId
                ? {
                    ...question,
                    answered: true,
                    isCorrect: null,
                    timedOut,
                    pointsEarned,
                  }
                : question,
            ),
          };
        });

        setRecentlyCompletedId(questionId);
        setActiveQuestion(null);
        setSelectedOption("");
        setTimeLeft(0);
        timeoutTriggeredRef.current = false;

        if (completed) {
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
    [activeQuestion, quiz, router, slug],
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
    setOpeningQuestionId(question.id);
    setRecentlyCompletedId("");
    setActionError("");
    setSelectedOption("");
    timeoutTriggeredRef.current = false;

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

      setLetterOpening(true);

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, reduceMotion ? 100 : 950);
      });

      const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
      );

      const remainingSeconds = data.expired
        ? 0
        : Math.max(0, limitSeconds - elapsedSeconds);

      setActiveQuestion({
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
      });

      setTimeLeft(remainingSeconds);
      setLetterOpening(false);
    } catch (err) {
      setLetterOpening(false);
      setActionError(
        err instanceof Error ? err.message : "Gagal membuka soal.",
      );
    } finally {
      openingRef.current = false;
      setOpeningQuestionId("");
    }
  };

  useEffect(() => {
    if (!activeQuestion || saving) return;

    const updateTimer = () => {
      const startedAt = new Date(activeQuestion.questionStartedAt).getTime();

      if (!Number.isFinite(startedAt)) {
        setTimeLeft(0);
        return;
      }

      const deadline = startedAt + activeQuestion.timeLimitSeconds * 1000;
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(timer);
  }, [activeQuestion, saving]);

  useEffect(() => {
    if (
      !activeQuestion ||
      timeLeft > 0 ||
      saving ||
      timeoutTriggeredRef.current
    ) {
      return;
    }

    timeoutTriggeredRef.current = true;
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

  const stars = Array.from({ length: 30 }, (_, index) => ({
    left: `${(index * 37 + 9) % 100}%`,
    top: `${(index * 53 + 5) % 100}%`,
    delay: (index % 7) * 0.3,
    size: index % 4 === 0 ? 4 : 2,
  }));

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eaf8ff] px-5 text-sky-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#ffffff_0%,#d8f2ff_50%,#b9e8ff_100%)]" />

        <motion.div
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute h-64 w-64 rounded-full border border-sky-300/50"
        />

        <motion.div
          animate={reduceMotion ? {} : { rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute h-44 w-44 rounded-full border border-dashed border-sky-400/50"
        />

        <div className="relative flex flex-col items-center gap-5 text-center">
          <motion.div
            animate={
              reduceMotion
                ? {}
                : { y: [0, -8, 0], rotate: [-3, 3, -3], scale: [1, 1.04, 1] }
            }
            transition={{ duration: 2, repeat: Infinity }}
            className="relative flex h-24 w-28 items-center justify-center rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-white to-sky-100 text-sky-600 shadow-xl shadow-sky-300/40"
          >
            <motion.div
              animate={reduceMotion ? {} : { rotateX: [0, 160, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatDelay: 0.2,
                ease: "easeInOut",
              }}
              className="absolute inset-x-3 top-3 h-8 origin-top rounded-t-xl border-2 border-sky-200 bg-sky-100"
            />
            <MailOpen className="relative z-10 h-12 w-12" />
            <motion.div
              animate={reduceMotion ? {} : { y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -right-2 -top-3 text-sky-400"
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          </motion.div>

          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Membuka Surat Ajaib!
            </h2>
            <p className="mt-2 text-sm text-sky-700/75">
              Sebentar, petualangan sainsmu sedang disiapkan...
            </p>
          </div>

          <LoaderCircle className="h-5 w-5 animate-spin text-sky-500" />
        </div>
      </main>
    );
  }

  if (error || !quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-sky-50 to-sky-200 px-5">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md rounded-[2rem] border border-white bg-white/90 p-8 text-center text-sky-950 shadow-2xl shadow-sky-300/30"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <BookOpen className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-2xl font-black">Misi Belum Bisa Dimulai</h1>
          <p className="mt-3 text-sm leading-6 text-sky-800/70">{error}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => void loadQuiz()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-bold text-white transition hover:bg-sky-600"
            >
              <RotateCcw className="h-4 w-4" />
              Coba Lagi
            </button>

            <button
              onClick={() => router.push(`/phenomena/${encodeURIComponent(slug)}`)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-5 py-3 font-bold text-sky-800 transition hover:bg-sky-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative h-[100svh] overflow-hidden bg-[#eaf8ff] text-sky-950 selection:bg-sky-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_10%,rgba(255,255,255,0.95),transparent_42%),radial-gradient(ellipse_at_90%_85%,rgba(125,211,252,0.35),transparent_45%),linear-gradient(135deg,#f8fdff,#e5f6ff_55%,#d3efff)]" />

      {stars.map((star, index) => (
        <motion.div
          key={index}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size + 1,
            height: star.size + 1,
            boxShadow: "0 0 8px rgba(56,189,248,0.45)",
          }}
          animate={
            reduceMotion ? {} : { opacity: [0.3, 1, 0.35], scale: [0.8, 1.4, 0.8] }
          }
          transition={{
            duration: 2 + star.delay,
            delay: star.delay,
            repeat: Infinity,
          }}
        />
      ))}

      <motion.div
        className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full border border-sky-300/50"
        animate={reduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute left-8 top-8 h-5 w-5 rounded-full bg-sky-300 shadow-lg shadow-sky-300/50" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full border border-sky-200/70"
        animate={reduceMotion ? {} : { rotate: -360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute right-5 top-14 h-8 w-8 rounded-full bg-white shadow-lg shadow-sky-200/60" />
      </motion.div>

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <AnimatePresence mode="wait">
          {!activeQuestion ? (
            <motion.section
              key="question-map"
              variants={cardVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.6rem] border border-white bg-white/85 p-3 shadow-2xl shadow-sky-200/50 backdrop-blur-xl sm:rounded-[2rem] sm:p-5">
                <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-sky-100/80 blur-3xl" />

                <div className="relative shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <motion.button
                      type="button"
                      whileHover={reduceMotion ? {} : { scale: 1.04, x: -2 }}
                      whileTap={reduceMotion ? {} : { scale: 0.94 }}
                      onClick={() => setShowExitConfirm(true)}
                      disabled={exiting || openingQuestionId !== ""}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 shadow-sm transition hover:bg-sky-50 disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                      <X className="h-4 w-4" />
                      Keluar
                    </motion.button>

                    <div className="min-w-0 flex-1 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-sky-500 sm:text-xs">
                        <Orbit className="h-3.5 w-3.5" />
                        Misi Penjelajah
                      </div>
                      <h1 className="mt-1 truncate text-sm font-black text-sky-950 sm:text-lg">
                        {quiz.phenomenon?.title || "Kuis Sains"}
                      </h1>
                      <p className="truncate text-[10px] font-medium text-sky-700/60 sm:text-xs">
                        Pilot: {quiz.nickname || "Astronaut"}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-right sm:px-3 sm:py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-sky-600/70 sm:text-[10px]">
                        Progres
                      </p>
                      <p className="text-xs font-black text-sky-700 sm:text-sm">
                        {answeredCount}
                        <span className="text-sky-400"> / {totalQuestions}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full border border-sky-100 bg-sky-100 sm:mt-4 sm:h-2.5">
                    <motion.div
                      className="relative h-full rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-blue-500"
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.65, ease: "easeOut" }}
                    >
                      <div className="absolute inset-0 bg-white/30" />
                    </motion.div>
                  </div>

                  <div className="mt-3 text-center sm:mt-4">
                    <motion.div
                      animate={reduceMotion ? {} : { y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-sky-600 sm:text-[10px]"
                    >
                      <Sparkles className="h-3 w-3" />
                      {allCompleted ? "Misi berhasil" : "Surat ajaib"}
                    </motion.div>

                    <h2 className="text-lg font-black tracking-tight text-sky-950 sm:text-2xl">
                      {allCompleted ? "Petualangan Selesai!" : "Pilih Surat Ajaib"}
                    </h2>
                    <p className="mt-1 text-[10px] text-sky-700/70 sm:text-xs">
                      {allCompleted
                        ? "Semua surat telah kamu buka. Saatnya melihat hasil petualangan!"
                        : "Pilih amplop untuk membuka tantangan sains berikutnya."}
                    </p>
                  </div>
                </div>

                {actionError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mt-2 shrink-0 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800"
                  >
                    {actionError}
                  </motion.div>
                )}

                {allCompleted ? (
                  <div className="relative flex flex-1 flex-col items-center justify-center gap-4 text-center">
                    <motion.div
                      animate={reduceMotion ? {} : { y: [0, -8, 0], rotate: [0, 4, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-sky-200 bg-gradient-to-br from-white to-sky-100 text-sky-500 shadow-xl shadow-sky-200/60 sm:h-24 sm:w-24"
                    >
                      <Trophy className="h-10 w-10 sm:h-12 sm:w-12" />
                    </motion.div>

                    <div>
                      <p className="text-sm font-bold text-sky-800">
                        Luar biasa, penjelajah!
                      </p>
                      <p className="mt-1 text-xs text-sky-700/65">
                        Semua surat telah dibuka. Lihat pencapaianmu!
                      </p>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={reduceMotion ? {} : { scale: 1.04, y: -2 }}
                      whileTap={reduceMotion ? {} : { scale: 0.96 }}
                      onClick={() =>
                        router.replace(
                          `/phenomena/${encodeURIComponent(slug)}/quiz/result/${encodeURIComponent(quiz.attemptId)}`,
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 px-6 py-3.5 font-extrabold text-white shadow-xl shadow-sky-300/40 transition hover:brightness-105 sm:px-8 sm:py-4"
                    >
                      <Trophy className="h-5 w-5" />
                      Lihat Hasil Petualangan
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <div className="relative mx-auto grid w-full max-w-4xl flex-1 grid-cols-5 grid-rows-2 gap-2.5 py-3 sm:gap-4 sm:py-4">
                      {pageQuestions.map((question, pageIndex) => {
                        const index = questionPage * PAGE_SIZE + pageIndex;
                        const isAnswered = question.answered;
                        const isTimedOut = question.timedOut;
                        const isBusy = openingQuestionId === question.id;
                        const isRecentlyCompleted = recentlyCompletedId === question.id;

                        const envelopeColor = isTimedOut
                          ? "border-red-400 bg-red-50 text-red-500"
                          : isAnswered
                            ? "border-green-400 bg-green-50 text-green-600"
                            : "border-sky-200 bg-gradient-to-br from-white to-sky-50 text-sky-600";

                        return (
                          <motion.button
                            key={question.id}
                            type="button"
                            initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                              delay: reduceMotion ? 0 : pageIndex * 0.04,
                              duration: 0.3,
                            }}
                            whileHover={
                              !isAnswered && !openingQuestionId && !reduceMotion
                                ? { y: -5, scale: 1.045 }
                                : undefined
                            }
                            whileTap={!isAnswered && !reduceMotion ? { scale: 0.93 } : undefined}
                            disabled={isAnswered || !!openingQuestionId || saving || exiting}
                            onClick={() => void openQuestion(question)}
                            aria-label={
                              isTimedOut
                                ? `Surat ${index + 1}, waktu habis`
                                : isAnswered
                                  ? `Surat ${index + 1}, sudah dijawab`
                                  : `Buka surat nomor ${index + 1}`
                            }
                            className={`group relative flex min-h-0 min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 p-1 text-xl font-black shadow-sm transition-all sm:rounded-3xl sm:text-4xl ${envelopeColor} ${
                              isBusy
                                ? "border-sky-400 shadow-lg shadow-sky-200"
                                : isRecentlyCompleted
                                  ? "shadow-lg shadow-sky-200/80"
                                  : "shadow-sky-100/80"
                            }`}
                          >
                            {!isAnswered && (
                              <motion.div
                                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/90 via-transparent to-sky-100/70"
                                animate={reduceMotion ? {} : { opacity: [0.3, 0.8, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              />
                            )}

                            {isBusy ? (
                              <div className="relative flex flex-col items-center gap-1.5">
                                <MailOpen className="h-7 w-7 animate-pulse text-sky-500 sm:h-10 sm:w-10" />
                                <LoaderCircle className="h-4 w-4 animate-spin text-sky-500" />
                                <span className="text-[8px] font-bold text-sky-600 sm:text-[10px]">
                                  Membuka...
                                </span>
                              </div>
                            ) : isAnswered ? (
                              <motion.div
                                initial={
                                  isRecentlyCompleted && !reduceMotion
                                    ? { scale: 0.65, rotate: -12 }
                                    : false
                                }
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 220, damping: 13 }}
                                className="relative flex flex-col items-center gap-1"
                              >
                                <MailOpen className="h-7 w-7 sm:h-10 sm:w-10" />
                                <span className="text-xs font-black sm:text-base">
                                  {index + 1}
                                </span>
                              </motion.div>
                            ) : (
                              <div className="relative flex flex-col items-center gap-1">
                                <div className="relative flex h-9 w-11 items-center justify-center rounded-lg border border-sky-200 bg-white shadow-sm sm:h-12 sm:w-14 sm:rounded-xl">
                                  <Mail className="h-6 w-6 sm:h-8 sm:w-8" />
                                  <div className="absolute left-0 right-0 top-0 h-0 border-x-[22px] border-t-[15px] border-x-transparent border-t-sky-100 sm:border-x-[28px] sm:border-t-[19px]" />
                                  <Star className="absolute right-0 top-0 h-3 w-3 fill-sky-300 text-sky-400 sm:h-4 sm:w-4" />
                                </div>
                                <span className="text-xs font-black sm:text-base">{index + 1}</span>
                                <span className="text-[7px] font-bold uppercase tracking-wider text-sky-500 sm:text-[9px]">
                                  Surat
                                </span>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="relative mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between gap-2">
                      <motion.button
                        type="button"
                        whileHover={reduceMotion ? {} : { x: -3 }}
                        whileTap={reduceMotion ? {} : { scale: 0.95 }}
                        onClick={() => setQuestionPage((page) => Math.max(0, page - 1))}
                        disabled={questionPage === 0 || !!openingQuestionId || saving}
                        className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 shadow-sm transition hover:bg-sky-50 disabled:invisible sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Sebelumnya
                      </motion.button>

                      <div className="flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                        <span className="text-xs font-bold text-sky-700">
                          {questionPage + 1} / {totalPages}
                        </span>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={reduceMotion ? {} : { x: 3 }}
                        whileTap={reduceMotion ? {} : { scale: 0.95 }}
                        onClick={() =>
                          setQuestionPage((page) => Math.min(totalPages - 1, page + 1))
                        }
                        disabled={
                          questionPage >= totalPages - 1 ||
                          !!openingQuestionId ||
                          saving
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-sky-200/70 transition hover:brightness-105 disabled:invisible sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                      >
                        Berikutnya
                        <ArrowRight className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <div className="relative mt-3 flex shrink-0 flex-wrap justify-center gap-x-4 gap-y-1.5 text-[9px] font-semibold text-sky-700/75 sm:gap-x-6 sm:text-xs">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-sky-500" />
                        Belum dikerjakan
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MailOpen className="h-4 w-4 text-green-600" />
                        Sudah dijawab
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MailOpen className="h-4 w-4 text-red-500" />
                        Waktu habis
                      </div>
                    </div>
                  </>
                )}

                {openingQuestionId && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mt-2 flex shrink-0 items-center justify-center gap-2 text-xs font-semibold text-sky-600"
                  >
                    <MailOpen className="h-4 w-4" />
                    Membuka surat ajaib...
                  </motion.p>
                )}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key={activeQuestion.id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto py-2"
            >
              <div className="relative my-auto overflow-hidden rounded-[1.75rem] border border-white bg-white/95 p-4 shadow-2xl shadow-sky-200/50 backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
                <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-sky-200/60 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-sky-100/80 blur-3xl" />

                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-extrabold text-sky-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    SOAL {String(activeQuestion.position).padStart(2, "0")}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
                      {difficultyLabels[activeQuestion.difficulty]}
                    </span>

                    <motion.span
                      animate={!reduceMotion && timeLeft <= 5 ? { scale: [1, 1.08, 1] } : {}}
                      transition={{ duration: 0.6, repeat: timeLeft <= 5 ? Infinity : 0 }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold tabular-nums ${
                        timeLeft <= 5
                          ? "border-sky-300 bg-sky-100 text-sky-800"
                          : "border-sky-200 bg-white text-sky-700"
                      }`}
                    >
                      <Clock3 className="h-3.5 w-3.5" />
                      {`${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`}
                    </motion.span>
                  </div>
                </div>

                <div className="relative mt-5 sm:mt-8">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-500">
                    <Zap className="h-3.5 w-3.5 text-sky-400" />
                    Tantangan untukmu
                  </p>
                  <h2 className="mt-3 text-lg font-extrabold leading-relaxed text-sky-950 sm:text-2xl">
                    {activeQuestion.text}
                  </h2>
                  <p className="mt-2 text-sm text-sky-700/65">
                    Pilih satu jawaban, lalu tekan tombol Simpan Jawaban.
                  </p>
                </div>

                <div className="relative mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
                  {activeQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === option.id;

                    return (
                      <motion.button
                        key={option.id}
                        type="button"
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: saving && !isSelected ? 0.55 : 1, y: 0 }}
                        transition={{
                          delay: reduceMotion ? 0 : index * 0.05,
                          duration: 0.25,
                        }}
                        whileHover={
                          !saving && timeLeft > 0 && !reduceMotion
                            ? { y: -2, scale: 1.012 }
                            : undefined
                        }
                        whileTap={!saving && !reduceMotion ? { scale: 0.985 } : undefined}
                        disabled={saving || timeLeft <= 0}
                        onClick={() => {
                          setSelectedOption(option.id);
                          setActionError("");
                        }}
                        aria-pressed={isSelected}
                        className={`group relative flex min-h-[58px] items-center gap-3 overflow-hidden rounded-2xl border-2 p-3 text-left transition-colors duration-200 sm:min-h-[76px] sm:p-4 ${
                          isSelected
                            ? "border-sky-400 bg-sky-100 shadow-lg shadow-sky-100"
                            : "border-sky-100 bg-white hover:border-sky-300 hover:bg-sky-50"
                        } disabled:cursor-not-allowed`}
                      >
                        {isSelected && (
                          <motion.span
                            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-sky-200/60 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        )}

                        <span
                          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors sm:h-10 sm:w-10 ${
                            isSelected
                              ? "bg-sky-500 text-white"
                              : "bg-sky-50 text-sky-600 group-hover:bg-sky-100"
                          }`}
                        >
                          {isSelected ? <Check className="h-5 w-5" /> : optionLetters[index] || index + 1}
                        </span>

                        <span
                          className={`relative flex-1 text-sm font-semibold leading-relaxed sm:text-base ${
                            isSelected ? "text-sky-900" : "text-sky-950/80"
                          }`}
                        >
                          {option.text}
                        </span>

                        {isSelected && (
                          <span className="relative h-3 w-3 shrink-0 rounded-full border-[3px] border-sky-500 bg-white" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {actionError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800"
                  >
                    {actionError}
                  </motion.div>
                )}

                <div className="relative mt-5 flex flex-col gap-3 border-t border-sky-100 pt-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
                  <p className="text-xs font-semibold text-sky-700/65">
                    {saving
                      ? "Menyimpan jawabanmu..."
                      : timeLeft <= 0
                        ? "Waktu habis, menyimpan jawaban..."
                        : selectedOption
                          ? "Pastikan pilihanmu sudah benar sebelum disimpan."
                          : "Pilih salah satu jawaban terlebih dahulu."}
                  </p>

                  <motion.button
                    type="button"
                    whileHover={
                      selectedOption && !saving && !reduceMotion
                        ? { scale: 1.025, y: -1 }
                        : undefined
                    }
                    whileTap={!reduceMotion ? { scale: 0.97 } : undefined}
                    onClick={() => {
                      if (selectedOption && !saving) {
                        void submitAnswer(selectedOption);
                      }
                    }}
                    disabled={!selectedOption || saving || timeLeft <= 0}
                    className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-200/70 transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-sky-200 disabled:from-sky-200 disabled:to-sky-300 disabled:text-white/90 disabled:shadow-none sm:min-w-44"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Simpan Jawaban
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* ANIMASI MEMBUKA SURAT */}
      <AnimatePresence>
        {letterOpening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-sky-950/20 px-5 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="flex w-full max-w-xs flex-col items-center rounded-[2rem] border border-white bg-white/95 px-8 py-9 text-center shadow-2xl shadow-sky-300/50"
            >
              <motion.div
                animate={
                  reduceMotion
                    ? {}
                    : { y: [0, -8, 0], rotate: [-3, 3, -3] }
                }
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative flex h-24 w-28 items-center justify-center rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-white to-sky-100 text-sky-500 shadow-lg shadow-sky-200/70"
              >
                <MailOpen className="h-14 w-14" />
                <motion.div
                  animate={reduceMotion ? {} : { rotateX: [0, 150, 0] }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                    repeatDelay: 0.1,
                  }}
                  className="absolute inset-x-3 top-3 h-7 origin-top rounded-t-lg border border-sky-200 bg-sky-100"
                />
                <motion.div
                  animate={reduceMotion ? {} : { scale: [0.7, 1.2, 0.7], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="absolute -right-3 -top-3 text-sky-400"
                >
                  <Sparkles className="h-7 w-7" />
                </motion.div>
              </motion.div>

              <h2 className="mt-6 text-xl font-black text-sky-950">
                Membuka Surat Ajaib
              </h2>
              <p className="mt-2 text-sm text-sky-700/70">
                Tantangan sainsmu segera muncul!
              </p>
              <LoaderCircle className="mt-4 h-5 w-5 animate-spin text-sky-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI KELUAR */}
      <AnimatePresence>
        {showExitConfirm && !activeQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/30 p-5 backdrop-blur-md"
            onClick={() => !exiting && setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 23 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-white bg-white p-6 text-sky-950 shadow-2xl shadow-sky-300/40"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-100 blur-2xl" />

              <motion.div
                animate={reduceMotion ? {} : { rotate: [-5, 5, -5], y: [0, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600"
              >
                <Rocket className="h-7 w-7" />
              </motion.div>

              <h2 className="relative mt-4 text-xl font-black">
                Tinggalkan Petualangan?
              </h2>
              <p className="relative mt-2 text-sm leading-6 text-sky-800/70">
                Percobaan kuis yang masih aktif akan dihapus. Kamu bisa memulai
                petualangan baru nanti.
              </p>

              {actionError && (
                <p className="relative mt-3 text-sm font-medium text-sky-700">
                  {actionError}
                </p>
              )}

              <div className="relative mt-6 flex gap-3">
                <motion.button
                  type="button"
                  whileTap={reduceMotion ? {} : { scale: 0.96 }}
                  disabled={exiting}
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 rounded-xl border border-sky-200 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-50 disabled:opacity-50"
                >
                  Lanjut Kuis
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={reduceMotion ? {} : { scale: 0.96 }}
                  disabled={exiting}
                  onClick={() => void handleExit()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 disabled:opacity-50"
                >
                  {exiting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {exiting ? "Keluar..." : "Keluar"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}