// components/quiz/QuizNamePanel.tsx
"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles, UserRound } from "lucide-react";

type QuizNamePanelProps = {
  initialName?: string;
  loading?: boolean;
  onContinue: (name: string) => void;
};

export default function QuizNamePanel({
  initialName = "",
  loading = false,
  onContinue,
}: QuizNamePanelProps) {
  const [name, setName] = useState(initialName);
  const validName = name.trim().length > 0;

  function handleContinue() {
    const trimmedName = name.trim();
    if (!trimmedName || loading) return;
    onContinue(trimmedName);
  }

  return (
    <section className="relative flex min-h-0 flex-1 flex-col items-center justify-start px-4 pb-3 pt-3 sm:px-6 sm:pt-4">
      {/* Dekorasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-10 size-12 rounded-full bg-sky-200/40 blur-xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-16 right-[8%] size-16 rounded-full bg-cyan-200/40 blur-2xl"
      />

      {/* Kartu nama */}
      <div className="relative w-full max-w-xl animate-[fadeInUp_500ms_ease-out_both] overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-white to-sky-50 p-5 shadow-[0_12px_35px_-20px_rgba(14,116,200,0.28)] sm:p-7">
        {/* Aksen dekoratif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-cyan-200/30 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -left-8 size-24 rounded-full bg-sky-200/30 blur-2xl"
        />

        {/* Judul */}
        <div className="relative text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-sky-700 sm:text-xs">
            <Sparkles size={12} className="text-amber-400" />
            CALON PENJELAJAH SAINS
          </span>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#083B66] sm:text-3xl">
            Siapa namamu?
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-600 sm:text-sm">
            Masukkan nama panggilanmu agar kami bisa menyapamu selama
            petualangan sains.
          </p>
        </div>

        {/* Form nama */}
        <form
          className="relative mt-5 sm:mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleContinue();
          }}
        >
          <label
            htmlFor="explorer-name"
            className="mb-2 block text-xs font-extrabold text-[#164E75] sm:text-sm"
          >
            Nama penjelajah
          </label>

          <div
            className={`flex min-h-12 items-center gap-3 rounded-2xl border-2 px-4 transition-all duration-300 sm:min-h-14 ${
              name.trim()
                ? "border-sky-300 bg-sky-50/80 shadow-[0_0_0_3px_rgba(125,211,252,0.12)]"
                : "border-sky-100 bg-slate-50/80 focus-within:border-sky-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]"
            }`}
          >
            <UserRound
              size={19}
              className={`shrink-0 transition-colors ${
                name.trim() ? "text-sky-600" : "text-sky-400"
              }`}
            />
            <input
              id="explorer-name"
              name="nickname"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, 40))}
              placeholder="Contoh: Bintang"
              autoComplete="nickname"
              maxLength={40}
              required
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent py-3 text-sm font-bold text-[#083B66] outline-none placeholder:font-medium placeholder:text-slate-400 sm:text-base"
            />
            {validName && (
              <Check
                size={18}
                className="shrink-0 animate-[fadeIn_200ms_ease-out] text-emerald-500"
              />
            )}
          </div>

          <p className="mt-2 text-[10px] font-medium text-slate-500">
            Maksimal 40 karakter.
          </p>

          {/* Tombol lanjut */}
          <button
            type="submit"
            disabled={!validName || loading}
            className="group relative mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-[0_6px_18px_rgba(14,165,233,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:from-sky-600 hover:via-blue-600 hover:to-cyan-600 hover:shadow-[0_10px_24px_rgba(14,165,233,0.32)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[450%]"
            />
            <span className="relative">
              {loading ? "MENYIAPKAN MISI..." : "LANJUTKAN"}
            </span>
            <ArrowRight
              size={17}
              className="relative transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </form>
      </div>

      {/* Pesan penutup */}
      <p className="relative mt-3 text-center text-[10px] font-semibold text-[#164E75]/80 sm:mt-4 sm:text-xs">
        <Sparkles size={12} className="mr-1 inline text-amber-400" />
        Dunia sains penuh kejutan sedang menunggumu!
      </p>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div,
          button,
          span {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}