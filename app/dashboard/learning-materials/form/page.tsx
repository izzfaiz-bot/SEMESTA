// app/dashboard/learning-materials/form/page.tsx
"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Check,
  FileText,
  Film,
  FolderOpen,
  Link2,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";

type MaterialType = "VIDEO" | "PPT";

type Phenomenon = {
  id: string | number;
  title?: string;
  name?: string;
  slug?: string;
};

type MaterialForm = {
  phenomenonId: string;
  title: string;
  type: MaterialType;
  description: string;
  url: string;
};

const initialForm: MaterialForm = {
  phenomenonId: "",
  title: "",
  type: "VIDEO",
  description: "",
  url: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function getObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function getErrorMessage(data: unknown, fallback: string): string {
  const object = getObject(data);
  return typeof object.error === "string"
    ? object.error
    : typeof object.message === "string"
      ? object.message
      : fallback;
}

function getPhenomena(data: unknown): Phenomenon[] {
  if (Array.isArray(data)) return data as Phenomenon[];

  const object = getObject(data);
  const candidates = [object.data, object.phenomena, object.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as Phenomenon[];

    const nested = getObject(candidate);
    for (const key of ["data", "phenomena", "items"]) {
      if (Array.isArray(nested[key])) return nested[key] as Phenomenon[];
    }
  }

  return [];
}

function getMaterial(data: unknown): Record<string, unknown> {
  const object = getObject(data);

  for (const key of ["data", "material", "item"]) {
    const nested = getObject(object[key]);
    if (Object.keys(nested).length > 0) return nested;
  }

  return object;
}

function normalizeType(value: unknown): MaterialType {
  const type = String(value ?? "").toUpperCase();
  return type === "PPT" || type === "PRESENTATION" || type === "SLIDE"
    ? "PPT"
    : "VIDEO";
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

export default function LearningMaterialFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get("id");
  const isEditing = Boolean(materialId);

  const [form, setForm] = useState<MaterialForm>({ ...initialForm });
  const [phenomena, setPhenomena] = useState<Phenomenon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    // Reset seluruh field sebelum memuat data baru.
    setForm({ ...initialForm });

    try {
      const phenomenaResponse = await fetch("/api/admin/dashboard/phenomena", {
        cache: "no-store",
      });
      const phenomenaData: unknown = await phenomenaResponse.json();

      if (!phenomenaResponse.ok) {
        throw new Error(
          getErrorMessage(phenomenaData, "Gagal memuat daftar fenomena."),
        );
      }

      setPhenomena(getPhenomena(phenomenaData));

      if (materialId) {
        const materialResponse = await fetch(
          `/api/admin/dashboard/materials/${encodeURIComponent(materialId)}`,
          { cache: "no-store" },
        );
        const materialData: unknown = await materialResponse.json();

        if (!materialResponse.ok) {
          throw new Error(
            getErrorMessage(materialData, "Gagal memuat data materi."),
          );
        }

        const material = getMaterial(materialData);
        const phenomenonValue =
          material.phenomenonId ??
          material.phenomenon_id ??
          getObject(material.phenomenon).id ??
          "";

        setForm({
          phenomenonId: String(phenomenonValue),
          title: String(material.title ?? ""),
          type: normalizeType(material.type),
          description: String(material.description ?? ""),
          url: String(material.url ?? material.videoUrl ?? material.fileUrl ?? ""),
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data.",
      );
    } finally {
      setLoading(false);
    }
  }, [materialId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateField = <K extends keyof MaterialForm>(
    field: K,
    value: MaterialForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.phenomenonId) {
      setError("Silakan pilih fenomena terlebih dahulu.");
      return;
    }

    if (!form.title.trim()) {
      setError("Judul materi wajib diisi.");
      return;
    }

    if (!form.url.trim()) {
      setError("URL materi wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        phenomenonId: form.phenomenonId,
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim() || null,
        url: form.url.trim(),
        isPublished: true,
      };

      const response = await fetch(
        isEditing
          ? `/api/admin/dashboard/materials/${encodeURIComponent(materialId!)}`
          : "/api/admin/dashboard/materials",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const responseData: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(responseData, "Materi gagal disimpan."),
        );
      }

      setSuccess(
        isEditing
          ? "Materi berhasil diperbarui dan dipublikasikan."
          : "Materi berhasil ditambahkan dan dipublikasikan.",
      );

      router.push("/dashboard/learning-materials");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan.",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedPhenomenon = phenomena.find(
    (phenomenon) => String(phenomenon.id) === form.phenomenonId,
  );

  const getPhenomenonName = (phenomenon: Phenomenon) =>
    phenomenon.title ??
    phenomenon.name ??
    phenomenon.slug ??
    `Fenomena ${phenomenon.id}`;

  return (
    <main className="min-h-screen overflow-y-auto bg-gradient-to-b from-sky-50 via-slate-50 to-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-4xl">
        <form onSubmit={handleSubmit}>
          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-sky-100/60">
            <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-6 sm:px-8 sm:py-7">
              <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-sky-100/70 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 right-28 h-36 w-36 rounded-full bg-blue-100/60 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-200">
                    {isEditing ? <FileText size={23} /> : <BookOpen size={23} />}
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
                      {isEditing ? "Edit Materi" : "Tambah Materi"}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Lengkapi identitas dan hubungan materi dengan fenomena.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/learning-materials")}
                  aria-label="Tutup form"
                  title="Kembali ke daftar materi"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="relative space-y-6 p-5 sm:p-8">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700"
                >
                  <X size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700"
                >
                  <Check size={18} className="mt-0.5 shrink-0" />
                  <p>{success}</p>
                </div>
              )}

              {loading ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-400">
                  <LoaderCircle size={30} className="animate-spin text-sky-500" />
                  <p className="text-sm font-medium">Memuat data materi...</p>
                </div>
              ) : (
                <>
                  <div>
                    <FieldLabel required>Fenomena</FieldLabel>
                    <div className="relative">
                      <FolderOpen
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <select
                        value={form.phenomenonId}
                        onChange={(event) =>
                          updateField("phenomenonId", event.target.value)
                        }
                        className={`${inputClass} appearance-none pl-11 pr-10`}
                        required
                        disabled={!phenomena.length}
                      >
                        <option value="">
                          {phenomena.length
                            ? "Pilih fenomena sains"
                            : "Belum ada fenomena tersedia"}
                        </option>
                        {phenomena.map((phenomenon) => (
                          <option
                            key={String(phenomenon.id)}
                            value={String(phenomenon.id)}
                          >
                            {getPhenomenonName(phenomenon)}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        ▼
                      </span>
                    </div>

                    {selectedPhenomenon && (
                      <p className="mt-2 text-xs text-sky-700">
                        Materi akan dihubungkan dengan fenomena{" "}
                        <span className="font-semibold">
                          {getPhenomenonName(selectedPhenomenon)}
                        </span>
                        .
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel required>Judul</FieldLabel>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) => updateField("title", event.target.value)}
                      placeholder="Contoh: Mengenal Siklus Air"
                      className={inputClass}
                      maxLength={200}
                      required
                    />
                    <div className="mt-1.5 flex justify-end">
                      <span className="text-xs text-slate-400">
                        {form.title.length}/200 karakter
                      </span>
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Type</FieldLabel>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => updateField("type", "VIDEO")}
                        disabled={isEditing}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                          form.type === "VIDEO"
                            ? "border-sky-300 bg-sky-50 ring-2 ring-sky-100"
                            : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                        } ${isEditing ? "cursor-not-allowed opacity-80" : ""}`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            form.type === "VIDEO"
                              ? "bg-sky-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Film size={21} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-slate-800">
                            Video
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            Materi dalam bentuk video edukatif
                          </span>
                        </span>
                        {form.type === "VIDEO" && (
                          <Check size={18} className="shrink-0 text-sky-600" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => updateField("type", "PPT")}
                        disabled={isEditing}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                          form.type === "PPT"
                            ? "border-sky-300 bg-sky-50 ring-2 ring-sky-100"
                            : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                        } ${isEditing ? "cursor-not-allowed opacity-80" : ""}`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            form.type === "PPT"
                              ? "bg-sky-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <FileText size={21} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-slate-800">
                            PDF
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            Materi presentasi atau slide pembelajaran
                          </span>
                        </span>
                        {form.type === "PPT" && (
                          <Check size={18} className="shrink-0 text-sky-600" />
                        )}
                      </button>
                    </div>

                    {isEditing && (
                      <p className="mt-2 text-xs text-slate-400">
                        Jenis materi tidak dapat diubah saat mengedit.
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel>Deskripsi</FieldLabel>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      placeholder="Jelaskan isi materi dan hal yang akan dipelajari siswa..."
                      className={`${inputClass} min-h-32 resize-y`}
                      rows={4}
                      maxLength={2000}
                    />
                    <div className="mt-1.5 flex justify-end">
                      <span className="text-xs text-slate-400">
                        {form.description.length}/2000 karakter
                      </span>
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>URL</FieldLabel>
                    <div className="relative">
                      <Link2
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="url"
                        value={form.url}
                        onChange={(event) => updateField("url", event.target.value)}
                        placeholder={
                          form.type === "VIDEO"
                            ? "https://www.youtube.com/watch?v=..."
                            : "https://drive.google.com/..."
                        }
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {form.type === "VIDEO"
                        ? "Masukkan tautan video edukatif yang dapat diakses siswa."
                        : "Masukkan tautan file presentasi atau dokumen yang dapat diakses siswa."}
                    </p>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="submit"
                  disabled={saving || loading || !phenomena.length}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200/60 transition hover:-translate-y-0.5 hover:from-sky-600 hover:to-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto sm:min-w-44"
                >
                  {saving ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving
                    ? "Menyimpan..."
                    : isEditing
                      ? "Simpan Perubahan"
                      : "Simpan Materi"}
                </button>
              </div>
            </div>
          </section>
        </form>

        <div className="py-5 text-center">
          <p className="text-xs font-medium tracking-wide text-slate-400">
            SEMESTA · SCIENCE ADVENTURE
          </p>
        </div>
      </div>
    </main>
  );
}