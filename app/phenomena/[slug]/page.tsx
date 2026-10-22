// app/phenomena/[slug]/page.tsx
import { Suspense } from "react";
import PhenomenonDetail from "@/components/phenomena/PhenomenonDetail";

type Props = {
  params: Promise<{ slug: string }>;
};

async function PhenomenonContent({ params }: Props) {
  const { slug } = await params;
  return <PhenomenonDetail slug={slug} />;
}

export default function PhenomenonPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <main className="flex h-[100dvh] items-center justify-center overflow-hidden bg-[#08152f] text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cyan-200" />
            <p className="text-sm font-semibold">
              Menyiapkan materi SEMESTA...
            </p>
          </div>
        </main>
      }
    >
      <PhenomenonContent params={params} />
    </Suspense>
  );
}