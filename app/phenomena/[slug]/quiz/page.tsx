
// app/phenomena/[slug]/quiz/page.tsx

import QuizPage from "@/components/quiz/QuizPage";
import QuizPlayPage from "@/components/quiz/QuizPlayPage";

type PageProps = {
  searchParams: Promise<{ attemptId?: string | string[] }>;
};

export default async function Page({ searchParams }: PageProps) {
  const query = await searchParams;
  const attemptId = Array.isArray(query.attemptId)
    ? query.attemptId[0]
    : query.attemptId;

  if (attemptId) {
    return <QuizPlayPage attemptId={attemptId} />;
  }

  return <QuizPage />;
}
