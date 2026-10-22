// app/dashboard/materials/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ListFilter,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import PhenomenonForm from "@/components/dashboard/phenomena/PhenomenonForm";
import type {
  Category,
  Phenomenon,
  PhenomenonFormData,
} from "@/modules/dashboard/phenomena/types/phenomenon.types";

const PAGE_SIZE = 6;

type ApiResponse = {
  message?: string;
  error?: string;
  detail?: string;
  data?: unknown;
  categories?: unknown;
  phenomena?: unknown;
};

async function readJson(response: Response): Promise<ApiResponse> {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

function getErrorMessage(data: ApiResponse, fallback: string) {
  return data.message || data.error || data.detail || fallback;
}

function extractList<T>(
  data: ApiResponse,
  key: "categories" | "phenomena",
): T[] {
  const value = data[key] ?? data.data;
  return Array.isArray(value) ? (value as T[]) : [];
}

function getCreatedAt(item: Phenomenon): number {
  const value = (item as Phenomenon & { createdAt?: string | Date })
    .createdAt;

  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getCategoryEmoji(item: Phenomenon, categories: Category[]): string {
  return (
    item.category?.emoji ||
    categories.find((category) => category.id === item.categoryId)?.emoji ||
    "📚"
  );
}

const chipClass =
  "inline-flex h-7 max-w-[250px] shrink-0 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2 text-[12px] font-medium leading-none text-sky-700 transition hover:bg-sky-100";

const chipIconClass = "h-3 w-3 shrink-0";

const chipEmojiClass =
  "flex h-3 w-3 shrink-0 items-center justify-center text-[12px] leading-none";

export default function MaterialsPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [phenomena, setPhenomena] = useState<Phenomenon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Phenomenon | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [categoryResponse, phenomenonResponse] = await Promise.all([
        fetch("/api/admin/dashboard/categories", {
          cache: "no-store",
          credentials: "same-origin",
        }),
        fetch("/api/admin/dashboard/phenomena", {
          cache: "no-store",
          credentials: "same-origin",
        }),
      ]);

      const [categoryData, phenomenonData] = await Promise.all([
        readJson(categoryResponse),
        readJson(phenomenonResponse),
      ]);

      if (
        [categoryResponse.status, phenomenonResponse.status].some(
          (status) => status === 401 || status === 403,
        )
      ) {
        router.replace("/login");
        return;
      }

      if (!categoryResponse.ok) {
        throw new Error(
          getErrorMessage(categoryData, "Gagal memuat kategori."),
        );
      }

      if (!phenomenonResponse.ok) {
        throw new Error(
          getErrorMessage(
            phenomenonData,
            "Gagal memuat daftar fenomena.",
          ),
        );
      }

      setCategories(extractList<Category>(categoryData, "categories"));
      setPhenomena(extractList<Phenomenon>(phenomenonData, "phenomena"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const filteredPhenomena = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return phenomena
      .filter((item) => {
        const categoryName =
          item.category?.name ??
          categories.find((category) => category.id === item.categoryId)
            ?.name ??
          "";

        const matchesSearch =
          !keyword ||
          item.title.toLowerCase().includes(keyword) ||
          (item.description ?? "").toLowerCase().includes(keyword) ||
          categoryName.toLowerCase().includes(keyword);

        const matchesCategory =
          categoryFilter === "all" || item.categoryId === categoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => getCreatedAt(b) - getCreatedAt(a));
  }, [phenomena, search, categoryFilter, categories]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPhenomena.length / PAGE_SIZE),
  );

  const paginatedPhenomena = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredPhenomena.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPhenomena, currentPage]);

  const startItem =
    filteredPhenomena.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    filteredPhenomena.length,
  );

  const hasActiveFilters =
    search.trim() !== "" || categoryFilter !== "all";

  const activeCategory = categories.find(
    (category) => category.id === categoryFilter,
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  function resetFilters() {
    setSearch("");
    setCategoryFilter("all");
    setCurrentPage(1);
    setSearchOpen(false);
    setFilterOpen(false);
  }

  function clearSearch() {
    setSearch("");
    setCurrentPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);

    if (!value.trim()) {
      setSearch("");
      setSearchOpen(false);
    }
  }

function selectCategory(categoryId: string) {
  setCategoryFilter(categoryId);
  setCurrentPage(1);
  setFilterOpen(false);
}

  function openCreateModal() {
    setEditingItem(null);
    setModalOpen(true);
    setError("");
    setNotice("");
  }

  function openEditModal(item: Phenomenon) {
    setEditingItem(item);
    setModalOpen(true);
    setError("");
    setNotice("");
    setOpenMenuId(null);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingItem(null);
  }

  async function handleSubmit(data: PhenomenonFormData) {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const isEditing = Boolean(editingItem);

      const endpoint = isEditing
        ? `/api/admin/dashboard/phenomena/${encodeURIComponent(editingItem!.id)}`
        : "/api/admin/dashboard/phenomena";

      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          slug: data.slug.trim(),
          categoryId: data.categoryId,
          description: data.description.trim(),
          content: data.content.trim(),
          imageUrl: data.imageUrl.trim() || null,
          sortOrder: Number(data.sortOrder) || 0,
          isPublished: data.isPublished,
        }),
      });

      const result = await readJson(response);

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Gagal menyimpan data fenomena."),
        );
      }

      setModalOpen(false);
      setEditingItem(null);
      setCurrentPage(1);
      setNotice(
        isEditing
          ? "Fenomena berhasil diperbarui."
          : "Fenomena berhasil ditambahkan.",
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan data fenomena.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Phenomenon) {
    const confirmed = window.confirm(
      `Hapus "${item.title}"? Tindakan ini tidak dapat dibatalkan.`,
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setOpenMenuId(null);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/admin/dashboard/phenomena/${encodeURIComponent(item.id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const result = await readJson(response);

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Gagal menghapus fenomena."),
        );
      }

      setNotice("Fenomena berhasil dihapus.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghapus fenomena.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1,
  );

  return (
    <main
      className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f4faff] p-3 text-slate-800 sm:p-4"
      onClick={() => setOpenMenuId(null)}
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-3">
        {/* Header */}
        <section className="relative shrink-0 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#087cf0] via-[#168bfa] to-[#35c8ff] p-4 text-white shadow-lg shadow-sky-200/50 sm:p-5">
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full border-[20px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-36 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[9px] font-bold tracking-[0.13em] text-white/90">
                <Sparkles size={12} />
                RUANG KONTROL SEMESTA
              </div>

              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">
                Daftar Fenomena
              </h1>

              <p className="mt-1 text-xs text-white/85">
                {phenomena.length} materi pembelajaran
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openCreateModal();
              }}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-xs font-bold text-sky-700 shadow-md transition hover:-translate-y-0.5 hover:bg-sky-50 sm:px-4"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Tambah Fenomena</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </section>

        {/* Notifications */}
        {error && (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
            <CircleAlert size={16} className="shrink-0" />
            <p className="min-w-0 flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Tutup pesan error"
              className="rounded-lg p-1 hover:bg-rose-100"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {notice && (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
            <CircleCheck size={16} className="shrink-0" />
            <p className="min-w-0 flex-1">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Tutup pesan sukses"
              className="rounded-lg p-1 hover:bg-emerald-100"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Content */}
        <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          {/* Title and actions */}
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <BookOpen size={19} />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-extrabold text-slate-800">
                  Materi Pembelajaran
                </h2>
                <p className="text-[11px] text-slate-500">
                  Kelola materi fenomena alam
                </p>
              </div>
            </div>

            <div
              className="flex shrink-0 items-center gap-1.5"
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className={`relative flex items-center transition-all duration-200 ${
                  searchOpen ? "w-36 sm:w-56" : "w-9"
                }`}
              >
                {searchOpen ? (
                  <>
                    <Search
                      size={15}
                      className="absolute left-3 z-10 text-sky-500"
                    />

                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      maxLength={50}
                      onChange={(event) =>
                        handleSearchChange(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          clearSearch();
                          setSearchOpen(false);
                        }
                      }}
                      placeholder="Cari materi..."
                      aria-label="Cari fenomena"
                      className="h-9 w-full rounded-xl border border-sky-200 bg-sky-50/70 pl-9 pr-8 text-xs text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    />

                    <button
                      type="button"
                      aria-label="Hapus pencarian"
                      onClick={() => {
                        clearSearch();
                        setSearchOpen(false);
                      }}
                      className="absolute right-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    title="Cari materi"
                    aria-label="Buka pencarian"
                    onClick={() => {
                      setSearchOpen(true);
                      setFilterOpen(false);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                  >
                    <Search size={17} />
                  </button>
                )}
              </div>

              <button
                type="button"
                title="Filter kategori"
                aria-label="Buka filter kategori"
                aria-expanded={filterOpen}
                onClick={() => {
                  setFilterOpen((value) => !value);
                  setSearchOpen(false);
                }}
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                  filterOpen || categoryFilter !== "all"
                    ? "border-sky-300 bg-sky-100 text-sky-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:bg-sky-50"
                }`}
              >
                <ListFilter size={17} />

                {categoryFilter !== "all" && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-white" />
                )}
              </button>

              <button
                type="button"
                title="Reset pencarian dan filter"
                aria-label="Reset pencarian dan filter"
                disabled={!hasActiveFilters && !searchOpen && !filterOpen}
                onClick={resetFilters}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* Category filters and active chips */}
          <div
            className="flex min-h-7 shrink-0 items-center justify-between gap-2 text-[12px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {/* Chip pencarian tetap tampil ketika filter kategori dibuka */}
              {search.trim() && (
                <button
                  type="button"
                  title={`Hapus pencarian: ${search.trim()}`}
                  onClick={clearSearch}
                  className={chipClass}
                >
                  <Search className={chipIconClass} />
                  <span className="truncate text-[12px] ">
                    Hasil pencarian &quot;{search.trim()}&quot;
                  </span>
                  <X className={chipIconClass} />
                </button>
              )}

              {/* Chip kategori aktif */}
              {categoryFilter !== "all" && (
                <button
                  type="button"
                  title={`Hapus kategori: ${activeCategory?.name || "Kategori"}`}
                  onClick={() => selectCategory("all")}
                  className={chipClass}
                >
                  <span className={chipEmojiClass}>
                    {activeCategory?.emoji || ""}
                  </span>
                  <span className="truncate">
                    {activeCategory?.name || "Kategori"}
                  </span>
                  <X className={chipIconClass} />
                </button>
              )}

              {/* Pilihan kategori tidak lagi bergantung pada hasActiveFilters */}
              {filterOpen && (
                <>
                  <button
                    type="button"
                    aria-pressed={categoryFilter === "all"}
                    onClick={() => selectCategory("all")}
                    className={`${chipClass} ${
                      categoryFilter === "all"
                        ? "border-sky-400 bg-sky-100"
                        : ""
                    }`}
                  >
                    <span>SEMUA</span>
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      title={category.name}
                      aria-pressed={categoryFilter === category.id}
                      onClick={() => selectCategory(category.id)}
                      className={`${chipClass} ${
                        categoryFilter === category.id
                          ? "border-sky-400 bg-sky-100"
                          : ""
                      }`}
                    >
                      <span className={chipEmojiClass}>
                        {category.emoji || "📚"}
                      </span>
                      <span className="truncate">{category.name}</span>
                    </button>
                  ))}
                </>
              )}

              {!hasActiveFilters && !filterOpen && (
                <span className="text-[12px] leading-none text-slate-400">
                  Semua kategori
                </span>
              )}
            </div>

            <p className="shrink-0 whitespace-nowrap text-[12px] leading-none text-slate-500">
              <span className="font-semibold text-slate-700">
                {filteredPhenomena.length}
              </span>{" "}
              hasil
            </p>
          </div>

          {/* Material cards */}
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            {loading ? (
              <div className="flex h-full min-h-32 flex-col items-center justify-center gap-3 text-slate-400">
                <LoaderCircle
                  size={30}
                  className="animate-spin text-sky-500"
                />
                <p className="text-sm font-medium">
                  Memuat daftar fenomena...
                </p>
              </div>
            ) : filteredPhenomena.length === 0 ? (
              <div className="flex h-full min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <BookOpen size={24} />
                </div>

                <h3 className="text-sm font-bold text-slate-700">
                  {phenomena.length === 0
                    ? "Belum ada fenomena"
                    : "Fenomena tidak ditemukan"}
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                  {phenomena.length === 0
                    ? "Tambahkan materi fenomena pertama."
                    : "Coba kata kunci lain atau ubah kategori."}
                </p>
              </div>
            ) : (
              <div className="grid h-full min-h-0 min-w-0 grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedPhenomena.map((item) => {
                  const categoryName =
                    item.category?.name ??
                    categories.find(
                      (category) => category.id === item.categoryId,
                    )?.name ??
                    "Kategori belum tersedia";

                  const categoryEmoji = getCategoryEmoji(item, categories);

                  return (
                    <article
                      key={item.id}
                      onClick={(event) => event.stopPropagation()}
                      className="group flex min-h-[140px] min-w-0 rounded-2xl border border-slate-200 bg-white p-3 transition duration-200 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100/60"
                    >
                      <div className="flex w-full min-w-0 items-start gap-3">
                        <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-sky-50 to-cyan-50">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl">
                              {categoryEmoji}
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex min-w-0 items-start gap-1">
                            <span
                              title={categoryName}
                              className="inline-flex h-7 min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-md bg-sky-50 px-2 text-[12px] font-bold leading-none text-sky-700"
                            >
                              <span className={chipEmojiClass}>
                                {categoryEmoji}
                              </span>
                              <span className="min-w-0 truncate">
                                {categoryName}
                              </span>
                            </span>

                            <div className="relative -mr-1 -mt-0.5 shrink-0">
                              <button
                                type="button"
                                aria-label={`Menu ${item.title}`}
                                aria-haspopup="menu"
                                aria-expanded={openMenuId === item.id}
                                title="Menu lainnya"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenuId((current) =>
                                    current === item.id ? null : item.id,
                                  );
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                              >
                                <MoreVertical size={18} />
                              </button>

                              {openMenuId === item.id && (
                                <div
                                  role="menu"
                                  onClick={(event) => event.stopPropagation()}
                                  className="absolute right-0 top-8 z-30 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/70"
                                >
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => openEditModal(item)}
                                    className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                                  >
                                    <Pencil size={14} />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => void handleDelete(item)}
                                    disabled={deletingId === item.id}
                                    className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {deletingId === item.id ? (
                                      <LoaderCircle
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={14} />
                                    )}
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <h3
                            title={item.title}
                            className="mt-2 line-clamp-2 min-h-9 break-words text-xs font-extrabold leading-[18px] text-slate-800"
                          >
                            {item.title}
                          </h3>

                          <p className="mt-1 line-clamp-2 min-h-8 break-words text-[11px] leading-4 text-slate-500">
                            {item.description || "Belum ada deskripsi."}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredPhenomena.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <p className="text-[12px] text-slate-500 sm:text-xs">
                <strong className="text-slate-700">
                  {startItem}–{endItem}
                </strong>{" "}
                dari{" "}
                <strong className="text-slate-700">
                  {filteredPhenomena.length}
                </strong>{" "}
                materi
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  aria-label="Halaman sebelumnya"
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>

                {visiblePages.map((page, index) => {
                  const previousPage = visiblePages[index - 1];
                  const showDots = index > 0 && page - previousPage > 1;

                  return (
                    <span key={page} className="flex items-center gap-1">
                      {showDots && (
                        <span className="px-0.5 text-xs text-slate-400">
                          …
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        aria-label={`Halaman ${page}`}
                        aria-current={
                          currentPage === page ? "page" : undefined
                        }
                        className={`h-8 min-w-8 rounded-lg px-2 text-[11px] font-bold transition ${
                          currentPage === page
                            ? "bg-sky-600 text-white shadow-sm shadow-sky-200"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Halaman berikutnya"
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
          onClick={closeModal}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="phenomenon-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="my-auto flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-2xl"
          >
            <header className="flex shrink-0 items-center justify-between gap-4 bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-4 text-white sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  {editingItem ? <Pencil size={19} /> : <Plus size={21} />}
                </div>

                <div className="min-w-0">
                  <h2
                    id="phenomenon-modal-title"
                    className="truncate text-base font-extrabold"
                  >
                    {editingItem ? "Edit Fenomena" : "Tambah Fenomena"}
                  </h2>
                  <p className="mt-0.5 text-xs text-white/80">
                    Lengkapi informasi materi pembelajaran
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Tutup formulir"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:bg-white/15 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <PhenomenonForm
                categories={categories}
                initialData={editingItem}
                saving={saving}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}