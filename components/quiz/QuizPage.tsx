
// components/quiz/QuizPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import QuizNamePanel from "./setup/QuizNamePanel";
import QuizMissionPanel from "./setup/QuizMissionPanel";
import QuizSetupHeader from "./setup/QuizSetupHeader";
import QuizSummaryPanel from "./setup/QuizSummaryPanel";
import type { Difficulty, QuizSetup } from "@/modules/quiz/types/quiz.types";

type SetupStep = 1 | 2 | 3;

type PhenomenonSummary = {
  title?: string;
  category?: string | { name?: string; title?: string };
  categoryName?: string;
  materials?: { title?: string }[];
};

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [step, setStep] = useState<SetupStep>(1);
  const [nickname, setNickname] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(30);
  const [questionCount, setQuestionCount] = useState(10);
  const [phenomenon, setPhenomenon] = useState<PhenomenonSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPhenomenon() {
      try {
        const response = await fetch(
          `/api/phenomena/${encodeURIComponent(slug)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Data fenomena tidak berhasil dimuat.");
        }

        const result = await response.json();
        const data = result.phenomenon ?? result.data ?? result;

        setPhenomenon(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setPhenomenon(null);
      }
    }

    void fetchPhenomenon();

    return () => controller.abort();
  }, [slug]);

  const category =
    typeof phenomenon?.category === "string"
      ? phenomenon.category
      : phenomenon?.category?.name ??
        phenomenon?.category?.title ??
        phenomenon?.categoryName ??
        "—";

  const material =
    phenomenon?.materials?.[0]?.title ??
    phenomenon?.title ??
    "—";

  function goToStep(nextStep: SetupStep) {
    if (loading) return;
    setError("");
    setStep(nextStep);
  }

  function handleBack() {
    if (loading) return;

    if (step === 1) {
      router.push(`/phenomena/${encodeURIComponent(slug)}`);
      return;
    }

    goToStep((step - 1) as SetupStep);
  }

  async function handleStart() {
    if (loading) return;

    const setup: QuizSetup = {
      nickname: nickname.trim(),
      difficulty,
      secondsPerQuestion,
      questionCount,
    };

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/quiz/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          nickname: setup.nickname,
          difficulty: setup.difficulty,
          questionCount: setup.questionCount,
          durationSeconds: setup.secondsPerQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Kuis gagal dimulai.");
      }

      const attemptId = data.attempt?.id ?? data.attemptId ?? data.id;

      if (!attemptId) {
        throw new Error("ID percobaan kuis tidak ditemukan dari server.");
      }

      router.push(
        `/phenomena/${encodeURIComponent(slug)}/quiz?attemptId=${encodeURIComponent(String(attemptId))}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memulai kuis.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-gradient-to-br from-[#dff5ff] via-[#eff8ff] to-[#e8eaff] p-2 sm:p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 size-72 rounded-full bg-sky-300/40 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 size-80 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="absolute right-[12%] top-[12%] size-40 rounded-full bg-cyan-200/30 blur-3xl" />
        <Sparkles
          className="absolute left-[7%] top-[18%] text-sky-400/70"
          size={22}
        />
        <Sparkles
          className="absolute bottom-[12%] right-[8%] text-indigo-400/70"
          size={25}
        />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/50 shadow-[0_25px_80px_-35px_rgba(37,99,235,0.4)] backdrop-blur-sm sm:rounded-[2rem]">
        <QuizSetupHeader
          step={step}
          nickname={nickname}
          loading={loading}
          onBack={handleBack}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {step === 1 && (
            <QuizNamePanel
              initialName={nickname}
              loading={loading}
              onContinue={(name) => {
                setNickname(name);
                goToStep(2);
              }}
            />
          )}

          {step === 2 && (
            <QuizMissionPanel
              difficulty={difficulty}
              questionCount={questionCount}
              secondsPerQuestion={secondsPerQuestion}
              loading={loading}
              error={error}
              onDifficultyChange={setDifficulty}
              onQuestionCountChange={setQuestionCount}
              onTimeChange={setSecondsPerQuestion}
              onContinue={() => goToStep(3)}
            />
          )}

          {step === 3 && (
            <QuizSummaryPanel
              nickname={nickname}
              category={category}
              material={material}
              difficulty={difficulty}
              questionCount={questionCount}
              secondsPerQuestion={secondsPerQuestion}
              loading={loading}
              onStart={handleStart}
            />
          )}
        </div>
      </div>
    </main>
  );
}
