// app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Atom,
  BookOpen,
  CircleHelp,
  Layers3,
  LoaderCircle,
  RefreshCw,
  Rocket,
  Sparkles,
  Telescope,
} from "lucide-react";

type DashboardStats = {
  totalCategories: number;
  totalPhenomena: number;
  totalMaterials: number;
  totalQuestions: number;
};

const initialStats: DashboardStats = {
  totalCategories: 0,
  totalPhenomena: 0,
  totalMaterials: 0,
  totalQuestions: 0,
};

const cards = [
  {
    title: "Kategori",
    key: "totalCategories",
    description: "Kelompok materi IPA",
    href: "/dashboard/materials",
    icon: Layers3,
    gradient: "from-violet-500 to-purple-600",
    text: "text-violet-600",
    decoration: "bg-violet-200/50",
  },
  {
    title: "Fenomena Alam",
    key: "totalPhenomena",
    description: "Petualangan mengenal alam",
    href: "/dashboard/materials",
    icon: Atom,
    gradient: "from-sky-400 to-blue-600",
    text: "text-sky-600",
    decoration: "bg-sky-200/60",
  },
  {
    title: "Materi Digital",
    key: "totalMaterials",
    description: "Video dan presentasi",
    href: "/dashboard/learning-materials",
    icon: BookOpen,
    gradient: "from-emerald-400 to-teal-600",
    text: "text-emerald-600",
    decoration: "bg-emerald-200/50",
  },
  {
    title: "Bank Soal",
    key: "totalQuestions",
    description: "Kuis untuk menguji pengetahuan",
    href: "/dashboard/quizzes",
    icon: CircleHelp,
    gradient: "from-amber-400 to-orange-500",
    text: "text-amber-600",
    decoration: "bg-amber-200/50",
  },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/dashboard/stats", {
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal mengambil data statistik.");
      }

      const data = await response.json();
      const source = data.stats ?? data;

      setStats({
        totalCategories: Number(
          source.totalCategories ?? source.categories ?? 0,
        ),
        totalPhenomena: Number(
          source.totalPhenomena ?? source.phenomena ?? 0,
        ),
        totalMaterials: Number(
          source.totalMaterials ?? source.materials ?? 0,
        ),
        totalQuestions: Number(
          source.totalQuestions ?? source.questions ?? 0,
        ),
      });
    } catch {
      setError("Data belum berhasil dimuat. Periksa koneksi database atau API.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#edf9ff] text-slate-800">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 lg:p-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          {/* Banner Sambutan */}
          <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-4 text-white shadow-lg shadow-blue-900/10 sm:p-5">
            <div className="pointer-events-none absolute -right-10 -top-14 -z-10 h-40 w-40 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -right-1 -top-6 -z-10 h-28 w-28 rounded-full border border-white/20" />
            <div className="pointer-events-none absolute -bottom-16 right-20 -z-10 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />

            <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
              <div className="max-w-xl">
                <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-sky-50 backdrop-blur-sm sm:text-xs">
                  <Sparkles size={12} />
                  PUSAT KENDALI PETUALANGAN
                </div>

                <h2 className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
                  Halo, Penjelajah
                  <br />
                  <span className="text-cyan-200">
                    Ilmu Pengetahuan!
                  </span>
                </h2>

                <p className="mt-1.5 max-w-md text-xs leading-5 text-blue-50 sm:text-sm">
                  Pantau konten pembelajaran SEMESTA dan kelola perjalanan
                  siswa dalam mengenal dunia sains.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/materials")}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-extrabold text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-cyan-50 sm:text-sm"
                >
                  Jelajahi Materi
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="relative mx-auto hidden h-28 w-28 items-center justify-center sm:flex lg:mr-5">
                <div className="absolute inset-0 rounded-full border border-dashed border-white/40" />
                <div className="absolute inset-3 rounded-full border border-white/25" />
                <div className="absolute right-1 top-4 h-2.5 w-2.5 rounded-full bg-amber-300 shadow-lg shadow-amber-300/50" />
                <div className="absolute bottom-3 left-1 h-2 w-2 rounded-full bg-cyan-200" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-xl backdrop-blur-md">
                  <Rocket
                    size={34}
                    strokeWidth={1.5}
                    className="-rotate-12 text-white"
                  />
                </div>

                <Sparkles
                  size={14}
                  className="absolute left-0 top-6 text-cyan-200"
                />
                <Sparkles
                  size={12}
                  className="absolute bottom-5 right-0 text-amber-200"
                />
              </div>
            </div>
          </div>

          {/* Header Ringkasan */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  <Telescope size={17} />
                </div>
                <h3 className="text-lg font-extrabold tracking-tight text-slate-800 sm:text-xl">
                  Ringkasan Konten
                </h3>
              </div>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Gambaran data pembelajaran SEMESTA.
              </p>
            </div>

            <button
  type="button"
  onClick={() => void loadStats()}
  disabled={loading}
  aria-label="Perbarui data"
  title="Perbarui data"
  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-600 shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-blue-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
>
  <RefreshCw
    size={16}
    strokeWidth={2.2}
    className={loading ? "animate-spin" : "transition-transform duration-300 hover:rotate-180"}
  />
</button>
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-medium text-rose-700">{error}</p>
              <button
                type="button"
                onClick={() => void loadStats()}
                className="text-xs font-bold text-rose-700 underline underline-offset-4"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Kartu Statistik */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              const value = stats[card.key];

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => router.push(card.href)}
                  className="group relative isolate overflow-hidden rounded-2xl border border-white bg-white p-3.5 text-left shadow-sm shadow-sky-900/[0.04] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-900/[0.08] focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 sm:p-4"
                >
                  <div
                    className={`pointer-events-none absolute -right-7 -top-7 -z-10 h-24 w-24 rounded-full ${card.decoration} transition duration-300 group-hover:scale-125`}
                  />

                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md`}
                    >
                      <Icon size={20} strokeWidth={2} />
                    </div>

                    <div className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition group-hover:bg-sky-50 group-hover:text-sky-600">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-bold text-slate-500 sm:text-sm">
                    {card.title}
                  </p>

                  <div className="mt-1 flex h-9 items-center">
                    {loading ? (
                      <LoaderCircle
                        size={22}
                        className="animate-spin text-sky-500"
                      />
                    ) : (
                      <span className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                        {value.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 min-h-4 text-[11px] leading-4 text-slate-400 sm:text-xs">
                    {card.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className={`text-[11px] font-extrabold sm:text-xs ${card.text}`}>
                      Lihat detail
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-sky-600"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <p className="pb-1 pt-1 text-center text-[10px] text-slate-400 sm:text-xs">
            © 2026 SEMESTA · Serunya Menjelajahi Sains dan Tata Alam
          </p>
        </div>
      </div>
    </section>
  );
}