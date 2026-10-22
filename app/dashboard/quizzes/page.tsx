// app/dashboard/quizzes/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  FileQuestion,
  Filter,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import QuestionForm, {
  type QuestionFormData,
  type QuestionFormPhenomenon,
} from "@/components/dashboard/quizzes/QuestionForm";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Option = { id?: string; text: string; isCorrect: boolean; sortOrder?: number };
type Category = { id: string; name: string; emoji?: string | null };
type Phenomenon = {
  id: string;
  title: string;
  name?: string;
  categoryId?: string;
  category?: Category;
};
type Question = {
  id: string;
  phenomenonId: string;
  text: string;
  explanation: string;
  difficulty: Difficulty;
  points: number;
  isPublished: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  phenomenon: Phenomenon;
  options: Option[];
};

const PAGE_SIZE = 50;

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "Mudah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HARD", label: "Sulit" },
];

const difficultyLabel = (value: Difficulty) =>
  DIFFICULTIES.find((item) => item.value === value)?.label ?? "Sedang";

const difficultyStyle: Record<Difficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD: "bg-rose-50 text-rose-700",
};

const statusLabels: Record<string, string> = {
  PUBLISHED: "Terpublikasi",
  DRAFT: "Draf",
  ARCHIVED: "Arsip",
};

function getError(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

export default function QuestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [phenomena, setPhenomena] = useState<Phenomenon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [searchOpen, setSearchOpen] = useState(Boolean(searchParams.get("search")));
  const [phenomenonFilter, setPhenomenonFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<Question | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [questionRes, categoryRes, phenomenonRes] = await Promise.all([
        fetch("/api/admin/dashboard/questions", { cache: "no-store" }),
        fetch("/api/admin/dashboard/categories", { cache: "no-store" }),
        fetch("/api/admin/dashboard/phenomena", { cache: "no-store" }),
      ]);

      if ([questionRes, categoryRes, phenomenonRes].some((res) => res.status === 401 || res.status === 403)) {
        router.replace("/login");
        return;
      }

      const [questionData, categoryData, phenomenonData] = await Promise.all([
        questionRes.json(),
        categoryRes.json(),
        phenomenonRes.json(),
      ]);

      if (!questionRes.ok) throw new Error(getError(questionData, "Gagal memuat bank soal."));
      if (!categoryRes.ok) throw new Error(getError(categoryData, "Gagal memuat kategori."));
      if (!phenomenonRes.ok) throw new Error(getError(phenomenonData, "Gagal memuat fenomena."));

      setQuestions(Array.isArray(questionData.questions) ? questionData.questions : []);
      setCategories(Array.isArray(categoryData.categories) ? categoryData.categories : []);
      setPhenomena(Array.isArray(phenomenonData.phenomena) ? phenomenonData.phenomena : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const value = search.trim();

      if (value) params.set("search", value);
      else params.delete("search");

      const query = params.toString();
      const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
      const currentUrl = `${window.location.pathname}${window.location.search}`;

      if (nextUrl !== currentUrl) router.replace(nextUrl, { scroll: false });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, router]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");

    return questions.filter((question) => {
      const phenomenonTitle = question.phenomenon?.title ?? question.phenomenon?.name ?? "";
      const category = question.phenomenon?.category;

      const matchesSearch =
        !query ||
        question.text.toLocaleLowerCase("id-ID").includes(query) ||
        phenomenonTitle.toLocaleLowerCase("id-ID").includes(query) ||
        (category?.name ?? "").toLocaleLowerCase("id-ID").includes(query);

      const matchesPhenomenon =
        !phenomenonFilter || question.phenomenonId === phenomenonFilter;
      const matchesCategory = !categoryFilter || category?.id === categoryFilter;
      const matchesDifficulty = !difficultyFilter || question.difficulty === difficultyFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" && question.isPublished && !question.isArchived) ||
        (statusFilter === "DRAFT" && !question.isPublished && !question.isArchived) ||
        (statusFilter === "ARCHIVED" && question.isArchived);

      return (
        matchesSearch &&
        matchesPhenomenon &&
        matchesCategory &&
        matchesDifficulty &&
        matchesStatus
      );
    });
  }, [
    questions,
    search,
    phenomenonFilter,
    categoryFilter,
    difficultyFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, phenomenonFilter, categoryFilter, difficultyFilter, statusFilter]);

  const activeFilterCount = [
    phenomenonFilter,
    categoryFilter,
    difficultyFilter,
    statusFilter !== "ALL" ? statusFilter : "",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch("");
    setPhenomenonFilter("");
    setCategoryFilter("");
    setDifficultyFilter("");
    setStatusFilter("ALL");
    setSearchOpen(false);
    setFilterOpen(false);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setError("");
    setNotice("");
    setFormOpen(true);
    setActiveMenu(null);
  };

  const openEdit = (question: Question) => {
    setEditing(question);
    setFormError("");
    setError("");
    setNotice("");
    setFormOpen(true);
    setActiveMenu(null);
  };

  const saveQuestion = async (data: QuestionFormData) => {
    setSaving(true);
    setFormError("");
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        editing
          ? `/api/admin/dashboard/questions/${encodeURIComponent(editing.id)}`
          : "/api/admin/dashboard/questions",
        {
          method: editing ? "PATCH" : "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) throw new Error(getError(result, "Gagal menyimpan soal."));

      setFormOpen(false);
      setEditing(null);
      setNotice(editing ? "Soal berhasil diperbarui." : "Soal berhasil ditambahkan.");
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan soal.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (
    question: Question,
    action: "publish" | "archive" | "restore",
  ) => {
    setActiveMenu(null);
    setError("");
    setNotice("");

    const payload =
      action === "publish"
        ? { isPublished: true, isArchived: false }
        : action === "archive"
          ? { isPublished: false, isArchived: true }
          : { isPublished: false, isArchived: false };

    try {
      const response = await fetch(
        `/api/admin/dashboard/questions/${encodeURIComponent(question.id)}`,
        {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) throw new Error(getError(data, "Gagal mengubah status soal."));

      setNotice(
        action === "publish"
          ? "Soal berhasil dipublikasikan."
          : action === "archive"
            ? "Soal berhasil diarsipkan."
            : "Soal berhasil dipulihkan.",
      );

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status soal.");
    }
  };

  const deleteQuestion = async () => {
    if (!deleteTarget) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/dashboard/questions/${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE", credentials: "same-origin" },
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) throw new Error(getError(data, "Gagal menghapus soal."));

      setDeleteTarget(null);
      setNotice("Soal berhasil dihapus.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus soal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f4faff] p-3 text-slate-800 sm:p-4">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-3">
        <section className="relative shrink-0 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#087cf0] via-[#168bfa] to-[#35c8ff] p-4 text-white shadow-sm sm:p-5">
          <div className="pointer-events-none absolute -right-8 -top-14 h-36 w-36 rounded-full border-[18px] border-white/10 sm:h-44 sm:w-44" />
          <div className="pointer-events-none absolute -bottom-16 right-32 h-32 w-32 rounded-full bg-cyan-200/20 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-wide">
                <FileQuestion size={13} />
                SEMESTA · DASHBOARD
              </div>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">Bank Soal</h1>
              <p className="mt-1 max-w-xl text-xs leading-5 text-blue-50 sm:text-sm">
                Kelola pertanyaan, jawaban, dan publikasi soal sains.
              </p>
            </div>

            <button
              onClick={openCreate}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-xs font-extrabold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:px-4 sm:text-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Tambah Soal</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </section>

        {(error || notice) && (
          <div
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? <CircleAlert size={15} className="shrink-0" /> : <CircleCheck size={15} className="shrink-0" />}
            <p className="min-w-0 flex-1">{error || notice}</p>
            <button
              onClick={() => {
                setError("");
                setNotice("");
              }}
              aria-label="Tutup notifikasi"
              className="shrink-0 rounded-md p-1 transition hover:bg-black/5"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex shrink-0 items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-800">Daftar Pertanyaan</h2>
            </div>

            <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5">
              {searchOpen && (
                <div className="relative w-32 sm:w-48 lg:w-60">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    ref={searchInputRef}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari pertanyaan..."
                    aria-label="Cari pertanyaan, fenomena, atau kategori"
                    className="h-9 w-full rounded-xl border border-blue-200 bg-blue-50/50 pl-8 pr-7 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      aria-label="Hapus pencarian"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              {filterOpen && (
                <>
                  <select
                    aria-label="Filter fenomena"
                    value={phenomenonFilter}
                    onChange={(event) => setPhenomenonFilter(event.target.value)}
                    className="h-9 w-24 rounded-xl border border-blue-200 bg-blue-50/50 px-1.5 text-[10px] font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white sm:w-36 sm:px-2 sm:text-[11px]"
                  >
                    <option value="">Semua fenomena</option>
                    {phenomena.map((phenomenon) => (
                      <option key={phenomenon.id} value={phenomenon.id}>
                        {phenomenon.title ?? phenomenon.name ?? "Tanpa nama"}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter kategori"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="h-9 w-24 rounded-xl border border-blue-200 bg-blue-50/50 px-1.5 text-[10px] font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white sm:w-36 sm:px-2 sm:text-[11px]"
                  >
                    <option value="">Semua kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.emoji ? `${category.emoji} ` : ""}
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter kesulitan"
                    value={difficultyFilter}
                    onChange={(event) => setDifficultyFilter(event.target.value)}
                    className="h-9 w-20 rounded-xl border border-blue-200 bg-blue-50/50 px-1.5 text-[10px] font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white sm:w-28 sm:px-2 sm:text-[11px]"
                  >
                    <option value="">Kesulitan</option>
                    {DIFFICULTIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <button
                onClick={() => {
                  setSearchOpen((open) => !open);
                  setFilterOpen(false);
                }}
                aria-label={searchOpen ? "Tutup pencarian" : "Buka pencarian"}
                title="Cari pertanyaan"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                  searchOpen || search
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Search size={16} />
              </button>

              <button
                onClick={() => {
                  setFilterOpen((open) => !open);
                  setSearchOpen(false);
                }}
                aria-label={filterOpen ? "Tutup filter" : "Buka filter"}
                title="Filter fenomena, kategori, dan kesulitan"
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                  filterOpen || activeFilterCount > 0
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Filter size={16} />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-black text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                onClick={resetFilters}
                aria-label="Reset pencarian dan filter"
                title="Reset pencarian dan filter"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-xl border border-slate-100">
            {loading ? (
              <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-slate-400">
                <LoaderCircle size={24} className="animate-spin text-blue-500" />
                <p className="text-xs font-medium">Memuat bank soal...</p>
              </div>
            ) : paginatedQuestions.length === 0 ? (
              <div className="flex h-full min-h-40 flex-col items-center justify-center px-4 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <BookOpen size={21} />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Soal tidak ditemukan</h3>
                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                  {questions.length
                    ? "Coba ubah kata pencarian atau filter yang digunakan."
                    : "Tambahkan pertanyaan pertama ke bank soal."}
                </p>
                {questions.length === 0 && (
                  <button
                    onClick={openCreate}
                    className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    <Plus size={15} />
                    Tambah Soal
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="w-12 px-3 py-3 text-center">No.</th>
                    <th className="px-3 py-3">Pertanyaan</th>
                    <th className="w-40 px-3 py-3">Fenomena</th>
                    <th className="w-36 px-3 py-3">Kategori</th>
                    <th className="w-24 px-3 py-3">Kesulitan</th>
                    <th className="w-14 px-2 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedQuestions.map((question, index) => {
                    const phenomenon = question.phenomenon;
                    const category = phenomenon?.category;
                    const isMenuOpen = activeMenu === question.id;

                    return (
                      <tr key={question.id} className="group transition hover:bg-sky-50/40">
                        <td className="px-3 py-3 text-center">
                          <span className="text-xs font-semibold tabular-nums text-slate-400">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </span>
                        </td>
                        <td className="max-w-[360px] px-3 py-3">
                          <p className="line-clamp-2 text-xs font-bold leading-5 text-slate-700" title={question.text}>
                            {question.text}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-600">
                            {phenomenon?.title ?? phenomenon?.name ?? "—"}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-600">
                            <span className="text-sm">{category?.emoji || "🔬"}</span>
                            <span className="truncate">{category?.name ?? "Tanpa kategori"}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ${difficultyStyle[question.difficulty]}`}>
                            {difficultyLabel(question.difficulty)}
                          </span>
                        </td>
                        <td className="relative px-2 py-3 text-center">
                          <button
                            onClick={() => setActiveMenu(isMenuOpen ? null : question.id)}
                            aria-label="Buka menu aksi"
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              isMenuOpen
                                ? "bg-blue-100 text-blue-700"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                          >
                            <MoreVertical size={17} />
                          </button>

                          {isMenuOpen && (
                            <>
                              <button
                                aria-label="Tutup menu"
                                className="fixed inset-0 z-20 cursor-default"
                                onClick={() => setActiveMenu(null)}
                              />
                              <div className="absolute right-8 top-10 z-30 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl shadow-slate-200/70">
                                <button
                                  onClick={() => openEdit(question)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <Pencil size={14} />
                                  Edit soal
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  onClick={() => {
                                    setDeleteTarget(question);
                                    setActiveMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
                                >
                                  <Trash2 size={14} />
                                  Hapus soal
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
              Menampilkan{" "}
              <span className="font-bold text-slate-600">
                {filteredQuestions.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filteredQuestions.length)}
              </span>{" "}
              dari <span className="font-bold text-slate-600">{filteredQuestions.length}</span> soal
            </p>

            <div className="flex items-center justify-between gap-1.5 sm:justify-end">
              <button
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={13} />
                Sebelumnya
              </button>

              <span className="px-1 text-[10px] font-semibold text-slate-500 sm:hidden">
                {currentPage}/{totalPages}
              </span>

              <div className="hidden items-center gap-1 sm:flex">
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((number) => number === 1 || number === totalPages || Math.abs(number - currentPage) <= 1)
                  .map((number, index, visible) => (
                    <span key={number} className="contents">
                      {index > 0 && number - visible[index - 1] > 1 && (
                        <span className="px-0.5 text-[10px] text-slate-400">…</span>
                      )}
                      <button
                        onClick={() => setPage(number)}
                        className={`h-8 min-w-8 rounded-lg px-2 text-[10px] font-extrabold transition ${
                          currentPage === number
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {number}
                      </button>
                    </span>
                  ))}
              </div>

              <button
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => {
            if (!saving) {
              setFormOpen(false);
              setEditing(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-sky-50 to-blue-50 px-4 py-3.5 sm:px-5">
              <div>
                <h2 id="question-modal-title" className="text-base font-black text-slate-800">
                  {editing ? "Edit Soal" : "Tambah Soal Baru"}
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Lengkapi pertanyaan dan pilihan jawaban.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!saving) {
                    setFormOpen(false);
                    setEditing(null);
                  }
                }}
                disabled={saving}
                aria-label="Tutup formulir"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </header>

            <QuestionForm
              phenomena={phenomena as QuestionFormPhenomenon[]}
              initialData={
                editing
                  ? {
                      phenomenonId: editing.phenomenonId,
                      text: editing.text,
                      explanation: editing.explanation ?? "",
                      difficulty: editing.difficulty,
                      points: editing.points,
                      options: editing.options ?? [],
                    }
                  : null
              }
              saving={saving}
              error={formError}
              onSubmit={saveQuestion}
              onCancel={() => {
                if (!saving) {
                  setFormOpen(false);
                  setEditing(null);
                }
              }}
            />
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-question-title"
            className="w-full max-w-sm rounded-[22px] border border-slate-100 bg-white p-5 shadow-2xl"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Trash2 size={20} />
            </div>
            <h2 id="delete-question-title" className="text-base font-black text-slate-800">
              Hapus soal ini?
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Soal dan pilihan jawabannya akan dihapus permanen. Data kuis terkait juga dapat terpengaruh.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => void deleteQuestion()}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {saving && <LoaderCircle size={14} className="animate-spin" />}
                Hapus Permanen
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}