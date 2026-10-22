// modules/quiz/types/quiz.types.ts

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "RANDOM";

export type Mode = "name" | "settings" | "playing" | "feedback" | "result";

export type QuestionStatus = "UNANSWERED" | "ANSWERED" | "TIMED_OUT";

export interface QuizOption {
  id: string;
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  attemptQuestionId: string;
  position: number;
  totalQuestions: number;
  question: string;
  imageUrl?: string | null;
  difficulty?: Difficulty;
  points?: number;
  secondsPerQuestion?: number;
  options: QuizOption[];
  answered?: boolean;
  status?: QuestionStatus;
  selectedOptionId?: string | null;
  isCorrect?: boolean | null;
  pointsEarned?: number;
  explanation?: string | null;
  questionStartedAt?: string | null;
  remainingSeconds?: number;
}

export interface AnswerResult {
  questionId?: string;
  attemptQuestionId?: string;
  isCorrect: boolean;
  expired?: boolean;
  explanation?: string | null;
  correctOptionId?: string | null;
  correctOptionText?: string | null;
  selectedOptionId?: string | null;
  pointsEarned?: number;
  basePoints?: number;
  bonusPoints?: number;
  responseTimeMs?: number;
  completed?: boolean;
  nextPosition?: number | null;
}

export interface QuizResult {
  attemptId?: string;
  nickname: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  timedOutAnswers?: number;
  totalQuestions: number;
  durationSeconds: number;
  accuracy?: number;
}

export interface QuizSetup {
  nickname: string;
  difficulty: Difficulty;
  secondsPerQuestion: number;
  questionCount: number;
}

export interface QuizAttempt {
  attemptId: string;
  nickname: string;
  phenomenonTitle: string;
  phenomenonSlug: string;
  questionCount: number;
  startedAt: string;
}

export interface QuizMapQuestion {
  id: string;
  attemptQuestionId: string;
  position: number;
  status: QuestionStatus;
}

export interface QuizPlayState {
  attempt: QuizAttempt;
  questions: QuizMapQuestion[];
  activeQuestion: QuizQuestion | null;
  selectedOptionId: string | null;
  remainingSeconds: number;
}
