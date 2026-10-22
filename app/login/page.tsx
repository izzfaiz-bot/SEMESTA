// app/login/page.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/me", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!active) return;

        if (response.ok) {
          const data = await response.json();

          if (data.admin) {
            router.replace("/dashboard");
            return;
          }
        }
      } catch {
        if (controller.signal.aborted) return;
      } finally {
        if (active) setChecking(false);
      }
    }

    checkSession();

    return () => {
      active = false;
      controller.abort();
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email atau kata sandi tidak valid.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Tidak dapat menghubungi server. Silakan coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden bg-[#e4f6ff]">
        <div className="text-center">
          <LoaderCircle className="mx-auto animate-spin text-blue-600" size={36} />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Memeriksa sesi SEMESTA...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-[#dff5ff] p-3 text-slate-800 sm:p-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-sky-300/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-300/40 blur-3xl" />
        <div className="absolute left-[15%] top-[15%] h-2 w-2 rounded-full bg-white shadow-[0_0_18px_5px_rgba(255,255,255,0.9)]" />
        <div className="absolute right-[18%] top-[22%] h-3 w-3 rounded-full bg-white shadow-[0_0_18px_5px_rgba(255,255,255,0.9)]" />
        <div className="absolute bottom-[16%] left-[23%] h-2 w-2 rounded-full bg-white shadow-[0_0_15px_4px_rgba(255,255,255,0.9)]" />
        <div className="absolute -right-20 top-12 h-52 w-52 rounded-full border border-white/60" />
      </div>

      <section className="relative grid h-full max-h-[720px] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[28px] border border-white/80 bg-white/85 shadow-[0_25px_80px_rgba(28,110,180,0.16)] backdrop-blur-xl md:h-[min(90dvh,680px)] md:grid-cols-[0.9fr_1.1fr] md:rounded-[32px]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#159ff3] via-[#087be8] to-[#3159d9] p-8 text-white md:flex md:flex-col md:justify-between lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-lg">
              <Rocket size={23} />
            </div>
            <div>
              <p className="text-lg font-black tracking-[0.16em]">SEMESTA</p>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-sky-100">
                SCIENCE ADVENTURE
              </p>
            </div>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="relative mb-5 flex h-40 w-40 items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-[0_0_65px_rgba(255,255,255,0.12)]">
              <div className="absolute inset-3 rounded-full border border-dashed border-white/40" />
              <div className="absolute right-1 top-5 rounded-full bg-white/20 p-2">
                <Star size={15} fill="currentColor" />
              </div>
              <div className="absolute bottom-5 left-2 rounded-full bg-white/20 p-2">
                <Sparkles size={15} />
              </div>
              <span className="select-none text-7xl" role="img" aria-label="Astronaut">
                👨‍🚀
              </span>
            </div>

            <span className="mb-3 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.18em]">
              <ShieldCheck className="mr-1.5 inline-block" size={12} />
              ADMINISTRATOR ACCESS
            </span>
            <h1 className="max-w-sm text-3xl font-black leading-tight lg:text-4xl">
              Selamat Datang
              <br />
              <span className="text-cyan-200">Penjelajah Sains!</span>
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-blue-100">
              Masuk ke pusat kendali untuk mengelola pengalaman belajar
              interaktif di SEMESTA.
            </p>
          </div>

          <div className="relative flex items-center justify-between border-t border-white/20 pt-4 text-[10px] font-medium text-blue-100">
            <span>MEDIA PEMBELAJARAN IPAS</span>
            <span>EDISI 2026</span>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col justify-center overflow-y-auto p-5 sm:p-8 md:overflow-hidden lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-5 flex items-center gap-3 md:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-200">
                <Rocket size={23} />
              </div>
              <div>
                <p className="text-lg font-black tracking-[0.14em] text-blue-700">
                  SEMESTA
                </p>
                <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                  SCIENCE ADVENTURE
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <LockKeyhole size={25} />
              </div>
              <p className="mb-2 text-[10px] font-extrabold tracking-[0.2em] text-blue-600">
                AREA ADMINISTRATOR
              </p>
              <h2 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                Masuk ke SEMESTA
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Masukkan email dan kata sandi administrator untuk melanjutkan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  Email administrator
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@semesta.id"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={255}
                  required
                  disabled={submitting}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  Kata sandi
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={submitting}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-600"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !email.trim() || !password}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#168bfa] to-[#4261ed] px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Masuk ke Dashboard
                    <Rocket size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[10px] leading-5 text-slate-400">
              <LockKeyhole className="mr-1 inline-block" size={12} />
              Akses terbatas untuk administrator SEMESTA.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}