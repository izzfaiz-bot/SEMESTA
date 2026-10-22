// app/dashboard/settings/password/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
  CircleAlert,
  CircleCheck,
} from "lucide-react";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const fields: {
  name: PasswordField;
  label: string;
  placeholder: string;
  description: string;
}[] = [
  {
    name: "currentPassword",
    label: "Kata Sandi Saat Ini",
    placeholder: "Masukkan kata sandi saat ini",
    description: "Verifikasi kata sandi akun yang sedang digunakan.",
  },
  {
    name: "newPassword",
    label: "Kata Sandi Baru",
    placeholder: "Minimal 8 karakter",
    description: "Gunakan kata sandi baru yang sulit ditebak.",
  },
  {
    name: "confirmPassword",
    label: "Konfirmasi Kata Sandi",
    placeholder: "Masukkan kembali kata sandi baru",
    description: "Pastikan sama dengan kata sandi baru.",
  },
];

const initialValues: Record<PasswordField, string> = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function updateField(name: PasswordField, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setMessage("");
    setSuccess(false);
  }

  function resetForm() {
    if (loading) return;
    setValues({ ...initialValues });
    setMessage("");
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (values.newPassword.length < 8) {
      setMessage("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      setMessage("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    if (values.currentPassword === values.newPassword) {
      setMessage("Kata sandi baru harus berbeda dari kata sandi saat ini.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/password", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setMessage(result?.message || "Gagal mengubah kata sandi.");
        return;
      }

      setValues({ ...initialValues });
      setSuccess(true);
      setMessage(result?.message || "Kata sandi berhasil diperbarui.");
    } catch {
      setMessage("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#f4faff] p-3 text-slate-800 sm:p-4">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3">
        {/* Header */}
        <section className="relative shrink-0 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#087cf0] via-[#168bfa] to-[#35c8ff] p-4 text-white shadow-lg shadow-sky-200/50 sm:p-5">
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full border-[20px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-36 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15">
                <KeyRound size={21} />
              </div>

              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[9px] font-bold tracking-[0.13em] text-white/90">
                  <Sparkles size={12} />
                  RUANG KONTROL SEMESTA
                </div>

                <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">
                  Ubah Kata Sandi
                </h1>

                <p className="mt-1 text-xs text-white/85">
                  Kelola keamanan akun administrator
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/15 px-3 text-xs font-bold text-white transition hover:bg-white/25"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Kembali</span>
            </button>
          </div>
        </section>

        {/* Notifications */}
        {message && (
          <div
            role="status"
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs ${
              success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {success ? (
              <CircleCheck size={16} className="shrink-0" />
            ) : (
              <CircleAlert size={16} className="shrink-0" />
            )}
            <p className="min-w-0 flex-1">{message}</p>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Tutup pesan"
              className="rounded-lg p-1 transition hover:bg-black/5"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Content */}
        <section className="flex min-w-0 flex-col gap-3 rounded-[22px] border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <LockKeyhole size={19} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-800">
                Keamanan Akun
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Perbarui kata sandi untuk menjaga akun tetap aman.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 py-1">
            {fields.map((field, index) => (
              <div key={field.name}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor={field.name}
                    className="text-xs font-bold text-slate-700 sm:text-sm"
                  >
                    {field.label}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {String(index + 1).padStart(2, "0")} / 03
                  </span>
                </div>

                <div className="relative">
                  <input
                    id={field.name}
                    type={visible[field.name] ? "text" : "password"}
                    value={values[field.name]}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    autoComplete={
                      field.name === "currentPassword"
                        ? "current-password"
                        : "new-password"
                    }
                    minLength={field.name === "currentPassword" ? 1 : 8}
                    required
                    disabled={loading}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 pr-12 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:opacity-60 sm:text-sm"
                  />

                  <button
                    type="button"
                    aria-label={
                      visible[field.name]
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    onClick={() =>
                      setVisible((current) => ({
                        ...current,
                        [field.name]: !current[field.name],
                      }))
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-sky-600"
                  >
                    {visible[field.name] ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 text-[11px] text-slate-400">
                  {field.description}
                </p>

                {field.name === "newPassword" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {values.newPassword &&
                      values.confirmPassword &&
                      values.newPassword === values.confirmPassword && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          <Check size={12} />
                          Konfirmasi cocok
                        </span>
                      )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-0 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw size={14} />
                Reset Form
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#087cf0] to-[#168bfa] px-4 text-xs font-bold text-white shadow-md shadow-sky-200/60 transition hover:-translate-y-0.5 hover:from-sky-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Simpan Kata Sandi
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}