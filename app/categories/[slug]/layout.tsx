// app/categories/[slug]/layout.tsx
import { Suspense, type ReactNode } from "react";

export default function CategoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b1c3c] text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <p className="text-sm font-semibold">
              Menyiapkan petualangan...
            </p>
          </div>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}