// app/phenomena/[slug]/layout.tsx
import { Suspense } from "react";

export default function PhenomenonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#08152f] text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cyan-200" />
            <p className="text-sm font-semibold">
              Menyiapkan materi SEMESTA...
            </p>
          </div>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}