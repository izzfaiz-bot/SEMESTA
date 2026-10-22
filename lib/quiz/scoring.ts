
// src/lib/quiz/scoring.ts

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

type ScoringInput = {
  difficulty: Difficulty;
  isCorrect: boolean;
  questionStartedAt: Date;
  answeredAt: Date;
  timeLimitSeconds: number;
  bonusMaxPoints: number;
  basePoints?: number;
};

export function calculateQuestionScore(input: ScoringInput) {
  const {
    difficulty,
    isCorrect,
    questionStartedAt,
    answeredAt,
    timeLimitSeconds,
    bonusMaxPoints,
    basePoints,
  } = input;

  if (
    !Number.isFinite(timeLimitSeconds) ||
    timeLimitSeconds <= 0 ||
    !Number.isFinite(bonusMaxPoints) ||
    bonusMaxPoints < 0
  ) {
    throw new Error("Pengaturan skor atau durasi tidak valid.");
  }

  const defaultPoints: Record<Difficulty, number> = {
    EASY: 500,
    MEDIUM: 1000,
    HARD: 1500,
  };

  const base = basePoints ?? defaultPoints[difficulty];

  if (!Number.isInteger(base) || base < 0) {
    throw new Error("Poin dasar tidak valid.");
  }

  if (!isCorrect) {
    return { basePoints: 0, bonusPoints: 0, totalPoints: 0 };
  }

  const elapsedSeconds = Math.max(
    0,
    (answeredAt.getTime() - questionStartedAt.getTime()) / 1000,
  );

  const remainingRatio = Math.max(
    0,
    Math.min(1, (timeLimitSeconds - elapsedSeconds) / timeLimitSeconds),
  );

  const bonusPoints = Math.round(bonusMaxPoints * remainingRatio);

  return {
    basePoints: base,
    bonusPoints,
    totalPoints: base + bonusPoints,
  };
}
