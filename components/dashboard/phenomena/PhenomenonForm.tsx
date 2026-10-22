// components/dashboard/phenomena/PhenomenonForm.tsx
"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Check, FileText, ImagePlus, LoaderCircle, Save } from "lucide-react";
import PhenomenonImageUpload from "@/components/dashboard/phenomena/PhenomenonImageUpload";
import type { Category, Phenomenon, PhenomenonFormData } from "@/modules/dashboard/phenomena/types/phenomenon.types";

type Props = {
  categories: Category[];
  initialData?: Phenomenon | null;
  saving?: boolean;
  onSubmit: (data: PhenomenonFormData) => void | Promise<void>;
  onCancel: () => void;
};

const emptyForm: PhenomenonFormData = {
  categoryId: "",
  title: "",
  slug: "",
  description: "",
  content: "",
  imageUrl: "",
  sortOrder: 0,
  isPublished: true,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-1.5">
      {label && (
        <span className="block text-xs font-bold text-slate-700 sm:text-sm">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50";

export default function PhenomenonForm({
  categories,
  initialData,
  saving = false,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<PhenomenonFormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isEditing = Boolean(initialData);
  const isBusy = saving || uploading;

  useEffect(() => {
    if (initialData) {
      const title = (initialData.title ?? "").replace(/[^a-zA-Z0-9\s]/g, "");

      setForm({
        ...emptyForm,
        categoryId: initialData.categoryId ?? initialData.category?.id ?? "",
        title,
        slug: slugify(title),
        description: initialData.description ?? "",
        content: initialData.content ?? "",
        imageUrl: initialData.imageUrl ?? "",
        sortOrder: initialData.sortOrder ?? 0,
        isPublished: initialData.isPublished ?? true,
      });
    } else {
      setForm({
        ...emptyForm,
        categoryId: categories[0]?.id ?? "",
      });
    }

    setImageFile(null);
    setFormError("");
  }, [initialData, categories]);

  function update<K extends keyof PhenomenonFormData>(
    key: K,
    value: PhenomenonFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleTitleChange(value: string) {
    const title = value.replace(/[^a-zA-Z0-9\s]/g, "");

    setForm((current) => ({
      ...current,
      title,
      slug: slugify(title),
    }));
  }

  async function uploadImage(file: File): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Gunakan gambar JPG, PNG, atau WebP.");
    }

    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
      throw new Error("Ukuran gambar maksimal 5 MB.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/dashboard/phenomena/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengunggah gambar.");
    }

    if (typeof result.imageUrl !== "string" || !result.imageUrl) {
      throw new Error("URL gambar tidak diterima dari server.");
    }

    return result.imageUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    setFormError("");

    const title = form.title.trim();
    const slug = slugify(title);
    const categoryId = form.categoryId.trim();
    const description = form.description.trim();

    if (!title) {
      setFormError("Nama fenomena wajib diisi.");
      return;
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(title)) {
      setFormError("Nama fenomena hanya boleh berisi huruf, angka, dan spasi.");
      return;
    }

    if (title.length > 180) {
      setFormError("Nama fenomena maksimal 180 karakter.");
      return;
    }

    if (!slug) {
      setFormError("Nama fenomena harus memiliki huruf atau angka.");
      return;
    }

    if (!categoryId) {
      setFormError("Silakan pilih kategori fenomena.");
      return;
    }

    if (!description) {
      setFormError("Deskripsi fenomena wajib diisi.");
      return;
    }

    if (description.length > 500) {
      setFormError("Deskripsi fenomena maksimal 500 karakter.");
      return;
    }

    if (!imageFile && !form.imageUrl.trim()) {
      setFormError("Pilih gambar fenomena terlebih dahulu.");
      return;
    }

    setUploading(Boolean(imageFile));

    try {
      const imageUrl = imageFile
        ? await uploadImage(imageFile)
        : form.imageUrl.trim();

      const payload: PhenomenonFormData = {
        categoryId,
        title,
        slug,
        description,
        content: form.content.trim(),
        imageUrl,
        sortOrder: initialData?.sortOrder ?? 0,
        isPublished: initialData?.isPublished ?? true,
      };

      await onSubmit(payload);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Gagal menyimpan fenomena.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {formError}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <FileText size={18} className="text-sky-500" />
          <h3 className="text-sm font-extrabold text-slate-800">
            Informasi Fenomena
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Nama Fenomena *"
            hint={`Slug otomatis: ${form.slug || "-"}`}
          >
            <input
              required
              maxLength={180}
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Contoh: Proses Terjadinya Hujan"
              className={inputClass}
              disabled={isBusy}
            />
          </Field>

          <Field label="Kategori *">
            <select
              required
              value={form.categoryId}
              onChange={(event) => update("categoryId", event.target.value)}
              className={inputClass}
              disabled={isBusy || categories.length === 0}
            >
              <option value="">Pilih kategori fenomena</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.emoji ? `${category.emoji} ` : ""}
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <span className="block text-xs text-rose-500">
                Tambahkan kategori terlebih dahulu.
              </span>
            )}
          </Field>
        </div>

        <Field label="">
          <textarea
            required
            rows={2}
            maxLength={500}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Jelaskan fenomena ini secara singkat..."
            className={`${inputClass} resize-y`}
            disabled={isBusy}
          />
          <span className="block text-right text-xs text-slate-400">
            {form.description.length}/500 karakter
          </span>
        </Field>

        <Field
          label="Konten Pembelajaran"
          hint="Opsional, untuk penjelasan lengkap mengenai fenomena."
        >
          <textarea
            rows={4}
            value={form.content}
            onChange={(event) => update("content", event.target.value)}
            placeholder="Tuliskan penjelasan lengkap mengenai fenomena..."
            className={`${inputClass} resize-y`}
            disabled={isBusy}
          />
        </Field>
      </section>

      <section className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
        <div className="flex items-center gap-2">
          <ImagePlus size={18} className="text-sky-500" />
          <h3 className="text-sm font-extrabold text-slate-800">
            Gambar Fenomena *
          </h3>
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Pilih gambar untuk melihat preview. Gambar baru akan diunggah saat
          kamu menekan tombol simpan.
        </p>

        <PhenomenonImageUpload
          value={form.imageUrl}
          onChange={(url) => update("imageUrl", url)}
          onFileChange={setImageFile}
          disabled={isBusy}
        />
      </section>

      <div className="flex flex-col-reverse gap-2.5 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isBusy || categories.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {uploading
            ? "Mengunggah gambar..."
            : saving
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : "Simpan Fenomena"}
        </button>
      </div>
    </form>
  );
}