// components/dashboard/quizzes/QuestionForm.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, CircleAlert, LoaderCircle } from "lucide-react";

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export type QuestionOptionInput = {
  id?: string;
  text: string;
  isCorrect: boolean;
  sortOrder?: number;
};

export type QuestionFormData = {
  phenomenonId: string;
  text: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  points: number;
  options: QuestionOptionInput[];
};

export type QuestionFormPhenomenon = {
  id: string;
  title: string;
  name?: string;
  category?: {
    name: string;
    emoji?: string | null;
  } | null;
};

type QuestionFormState = Omit<QuestionFormData, "difficulty"> & {
  difficulty: QuestionDifficulty | "";
};

type QuestionFormProps = {
  phenomena: QuestionFormPhenomenon[];
  initialData?: QuestionFormData | null;
  saving?: boolean;
  error?: string;
  onSubmit: (data: QuestionFormData) => void | Promise<void>;
  onCancel: () => void;
};

const DIFFICULTIES: {
  value: QuestionDifficulty;
  label: string;
  points: number;
}[] = [
  { value: "EASY", label: "Mudah", points: 500 },
  { value: "MEDIUM", label: "Sedang", points: 1000 },
  { value: "HARD", label: "Sulit", points: 1500 },
];

const EMPTY_OPTIONS: QuestionOptionInput[] = [
  { text: "", isCorrect: true, sortOrder: 1 },
  { text: "", isCorrect: false, sortOrder: 2 },
  { text: "", isCorrect: false, sortOrder: 3 },
  { text: "", isCorrect: false, sortOrder: 4 },
];

function getPoints(difficulty: QuestionDifficulty | "") {
  return DIFFICULTIES.find((item) => item.value === difficulty)?.points ?? 0;
}

export default function QuestionForm({
  phenomena,
  initialData,
  saving = false,
  error = "",
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const [form, setForm] = useState<QuestionFormState>({
    phenomenonId: "",
    text: "",
    explanation: "",
    difficulty: "",
    points: 0,
    options: EMPTY_OPTIONS.map((option) => ({ ...option })),
  });

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setValidationError("");

    const difficulty = initialData?.difficulty ?? "";

    setForm({
      phenomenonId: initialData?.phenomenonId ?? "",
      text: initialData?.text ?? "",
      explanation: initialData?.explanation ?? "",
      difficulty,
      points: getPoints(difficulty),
      options: Array.from({ length: 4 }, (_, index) => ({
        id: initialData?.options?.[index]?.id,
        text: initialData?.options?.[index]?.text ?? "",
        isCorrect: initialData?.options?.[index]?.isCorrect ?? index === 0,
        sortOrder: index + 1,
      })),
    });
  }, [initialData, phenomena]);

  function updateOption(
    index: number,
    key: "text" | "isCorrect",
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => {
        if (key === "isCorrect") {
          return { ...option, isCorrect: optionIndex === index };
        }

        return optionIndex === index
          ? { ...option, text: String(value) }
          : option;
      }),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    if (!form.phenomenonId) {
      setValidationError("Pilih fenomena terlebih dahulu.");
      return;
    }

    if (!form.difficulty) {
      setValidationError("Pilih tingkat kesulitan terlebih dahulu.");
      return;
    }

    if (!form.text.trim()) {
      setValidationError("Teks pertanyaan wajib diisi.");
      return;
    }

    if (form.options.some((option) => !option.text.trim())) {
      setValidationError("Lengkapi keempat pilihan jawaban.");
      return;
    }

    if (form.options.filter((option) => option.isCorrect).length !== 1) {
      setValidationError("Pilih tepat satu jawaban yang benar.");
      return;
    }

    await onSubmit({
      ...form,
      difficulty: form.difficulty,
      points: getPoints(form.difficulty),
      text: form.text.trim(),
      explanation: form.explanation.trim(),
      options: form.options.map((option, index) => ({
        ...option,
        text: option.text.trim(),
        sortOrder: index + 1,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        {(validationError || error) && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <CircleAlert size={17} className="mt-0.5 shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600">
              Fenomena <span className="text-rose-500">*</span>
            </span>
            <select
              required
              value={form.phenomenonId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phenomenonId: event.target.value,
                }))
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Pilih fenomena</option>
              {phenomena.map((phenomenon) => (
                <option key={phenomenon.id} value={phenomenon.id}>
                  {phenomenon.category?.emoji
                    ? `${phenomenon.category.emoji} `
                    : ""}
                  {phenomenon.title ?? phenomenon.name}
                </option>
              ))}
            </select>

            {phenomena.length === 0 && (
              <span className="block text-[11px] text-amber-600">
                Belum ada fenomena. Tambahkan fenomena terlebih dahulu.
              </span>
            )}
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600">
              Tingkat kesulitan <span className="text-rose-500">*</span>
            </span>
            <select
              required
              value={form.difficulty}
              onChange={(event) => {
                const difficulty = event.target.value as QuestionDifficulty | "";

                setForm((current) => ({
                  ...current,
                  difficulty,
                  points: getPoints(difficulty),
                }));
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Pilih tingkat kesulitan</option>
              {DIFFICULTIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-slate-600">
            Teks pertanyaan <span className="text-rose-500">*</span>
          </span>
          <textarea
            required
            maxLength={10000}
            rows={3}
            value={form.text}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                text: event.target.value,
              }))
            }
            placeholder="Tuliskan pertanyaan berdasarkan fenomena..."
            className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <p className="text-right text-[11px] text-slate-400">
            {form.text.length.toLocaleString("id-ID")}/10.000 karakter
          </p>
        </label>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-700">
                Pilihan Jawaban
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Pilih lingkaran pada jawaban yang benar.
              </p>
            </div>
            <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-extrabold text-blue-700">
              4 pilihan
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {form.options.map((option, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-3 transition ${
                  option.isCorrect
                    ? "border-emerald-300 bg-emerald-50/60"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                      option.isCorrect
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>

                  <label className="flex cursor-pointer items-center gap-2 text-[11px] font-bold text-slate-600">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={option.isCorrect}
                      onChange={() => updateOption(index, "isCorrect", true)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    {option.isCorrect ? "Jawaban benar" : "Tandai benar"}
                  </label>
                </div>

                <textarea
                  required
                  rows={2}
                  maxLength={2000}
                  value={option.text}
                  onChange={(event) =>
                    updateOption(index, "text", event.target.value)
                  }
                  placeholder={`Tulis pilihan ${String.fromCharCode(65 + index)}...`}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600">
              Pembahasan jawaban
            </span>
            <textarea
              rows={3}
              maxLength={10000}
              value={form.explanation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  explanation: event.target.value,
                }))
              }
              placeholder="Jelaskan alasan jawaban yang benar..."
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
      </div>

      <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving || phenomena.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Check size={17} />
          )}
          {saving
            ? "Menyimpan..."
            : initialData
              ? "Simpan Perubahan"
              : "Simpan Soal"}
        </button>
      </footer>
    </form>
  );
}