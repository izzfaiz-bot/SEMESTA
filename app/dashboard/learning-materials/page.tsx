
// app/dashboard/learning-materials/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, FileText,
  Film, LoaderCircle, MoreVertical, Pencil, Plus, RotateCcw, Search,
  SlidersHorizontal, Trash2, Video, X,
} from "lucide-react";

type MaterialType = "VIDEO" | "PPT";
type TypeFilter = "ALL" | MaterialType;

interface Category {
  id: string;
  name: string;
  emoji?: string | null;
}

interface Phenomenon {
  id: string;
  title: string;
  slug?: string;
  categoryId?: string | null;
  category?: Category | null;
}

interface LearningMaterial {
  id: string;
  phenomenonId: string;
  type: MaterialType;
  title: string;
  description?: string | null;
  url: string;
  storagePath?: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  phenomenon?: Phenomenon | null;
}

const API_URL = "/api/admin/dashboard/materials";
const PHENOMENA_URL = "/api/admin/dashboard/phenomena";
const CATEGORIES_URL = "/api/admin/dashboard/categories";
const PAGE_SIZE = 12;

function getArray<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== "object") return [];
  const object = data as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(object[key])) return object[key] as T[];
  }

  if (object.data && typeof object.data === "object") {
    const nested = object.data as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(nested[key])) return nested[key] as T[];
    }
  }

  return [];
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const object = data as Record<string, unknown>;
    if (typeof object.error === "string") return object.error;
    if (typeof object.message === "string") return object.message;
  }
  return fallback;
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function TypeBadge({ type }: { type: MaterialType }) {
  const isVideo = type === "VIDEO";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isVideo ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"}`}>
      {isVideo ? <Film size={12} /> : <FileText size={12} />}
      {isVideo ? "Video" : "PDF"}
    </span>
  );
}

export default function LearningMaterialsPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [phenomena, setPhenomena] = useState<Phenomenon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [phenomenonFilter, setPhenomenonFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LearningMaterial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [materialsResponse, phenomenaResponse, categoriesResponse] = await Promise.all([
        // Perbaikan: minta hingga 50 materi dari API, bukan default 10.
        fetch(`${API_URL}?page=1&pageSize=50`, { cache: "no-store" }),
        fetch(PHENOMENA_URL, { cache: "no-store" }),
        fetch(CATEGORIES_URL, { cache: "no-store" }),
      ]);

      if ([materialsResponse, phenomenaResponse, categoriesResponse].some((response) => response.status === 401 || response.status === 403)) {
        router.replace("/login");
        return;
      }

      const [materialsData, phenomenaData, categoriesData] = await Promise.all([
        materialsResponse.json(),
        phenomenaResponse.json(),
        categoriesResponse.json(),
      ]);

      if (!materialsResponse.ok) throw new Error(getErrorMessage(materialsData, "Gagal memuat daftar materi."));
      if (!phenomenaResponse.ok) throw new Error(getErrorMessage(phenomenaData, "Gagal memuat daftar fenomena."));
      if (!categoriesResponse.ok) throw new Error(getErrorMessage(categoriesData, "Gagal memuat kategori."));

      setMaterials(getArray<LearningMaterial>(materialsData, ["materials", "data"]));
      setPhenomena(getArray<Phenomenon>(phenomenaData, ["phenomena", "data"]));
      setCategories(getArray<Category>(categoriesData, ["categories", "data"]));
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
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenMenu(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setDeleteTarget(null);
        setFilterOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const phenomenonById = useMemo(() => new Map(phenomena.map((phenomenon) => [phenomenon.id, phenomenon])), [phenomena]);

  const getPhenomenon = useCallback(
    (item: LearningMaterial) => item.phenomenon ?? phenomenonById.get(item.phenomenonId) ?? null,
    [phenomenonById],
  );

  const getCategory = useCallback(
    (item: LearningMaterial) => {
      const phenomenon = getPhenomenon(item);
      return phenomenon?.category ?? (phenomenon?.categoryId ? categoryById.get(phenomenon.categoryId) : undefined) ?? null;
    },
    [categoryById, getPhenomenon],
  );

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...materials]
      .filter((item) => {
        const phenomenon = getPhenomenon(item);
        const category = getCategory(item);

        const matchesSearch =
          !query ||
          item.title.toLowerCase().includes(query) ||
          (item.description ?? "").toLowerCase().includes(query) ||
          (phenomenon?.title ?? "").toLowerCase().includes(query) ||
          (category?.name ?? "").toLowerCase().includes(query);

        return (
          matchesSearch &&
          (typeFilter === "ALL" || item.type === typeFilter) &&
          (categoryFilter === "ALL" || category?.id === categoryFilter) &&
          (phenomenonFilter === "ALL" || item.phenomenonId === phenomenonFilter)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [materials, search, typeFilter, categoryFilter, phenomenonFilter, getPhenomenon, getCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedMaterials = filteredMaterials.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const videoCount = materials.filter((item) => item.type === "VIDEO").length;
  const pdfCount = materials.filter((item) => item.type === "PPT").length;

  const availablePhenomena = useMemo(
    () => categoryFilter === "ALL"
      ? phenomena
      : phenomena.filter((phenomenon) => (phenomenon.categoryId ?? phenomenon.category?.id) === categoryFilter),
    [phenomena, categoryFilter],
  );

  const hasFilters = search.trim() !== "" || typeFilter !== "ALL" || categoryFilter !== "ALL" || phenomenonFilter !== "ALL";

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setPhenomenonFilter("ALL");
    setPage(1);
  };

  const changeCategory = (value: string) => {
    setCategoryFilter(value);
    setPhenomenonFilter("ALL");
    setPage(1);
  };

  const changePhenomenon = (value: string) => {
    setPhenomenonFilter(value);
    setPage(1);
  };

  const handleTogglePublish = async (item: LearningMaterial) => {
    setUpdatingId(item.id);
    setOpenMenu(null);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) throw new Error(getErrorMessage(data, "Gagal mengubah status publikasi."));

      const updated = data.material ?? data.data ?? {};
      setMaterials((current) => current.map((material) =>
        material.id === item.id
          ? {
              ...material,
              ...(typeof updated === "object" ? updated : {}),
              isPublished: typeof updated.isPublished === "boolean" ? updated.isPublished : !item.isPublished,
            }
          : material,
      ));

      setNotice(item.isPublished ? "Materi berhasil diarsipkan." : "Materi berhasil dipublikasikan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status materi.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) throw new Error(getErrorMessage(data, "Gagal menghapus materi."));

      setMaterials((current) => current.filter((item) => item.id !== deleteTarget.id));
      setNotice("Materi berhasil dihapus.");
      setDeleteTarget(null);
      setOpenMenu(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus materi.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (item: LearningMaterial) => {
    setOpenMenu(null);
    router.push(`/dashboard/learning-materials/form?id=${encodeURIComponent(item.id)}`);
  };

  const goToMaterialForm = () => router.push("/dashboard/learning-materials/form");

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f4faff] p-3 text-slate-800 sm:p-4" onClick={() => setOpenMenu(null)}>
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-3">
        <header className="relative shrink-0 overflow-hidden rounded-[22px] bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-5 py-4 text-white shadow-lg shadow-blue-900/10 sm:px-6">
          <div className="pointer-events-none absolute -right-8 -top-14 h-44 w-44 rounded-full border-[20px] border-white/10" />
          <div className="pointer-events-none absolute -right-1 top-3 h-28 w-28 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -bottom-14 right-1/3 h-32 w-32 rounded-full bg-cyan-200/15 blur-2xl" />
          <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.15em] text-blue-50 backdrop-blur">
                <BookOpen size={13} /> RUANG KONTROL SEMESTA
              </div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Materi Pembelajaran</h1>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-blue-50/90 sm:text-sm">
                Kelola materi PDF dan video edukasi untuk petualangan sains peserta didik.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button type="button" onClick={(event) => { event.stopPropagation(); goToMaterialForm(); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-[0.98] sm:px-4 sm:text-sm">
                <Plus size={16} /> Tambah Materi
              </button>
            </div>
          </div>
        </header>

        <section className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Total Materi", value: materials.length, icon: BookOpen, color: "bg-blue-50 text-blue-600" },
            { label: "Video", value: videoCount, icon: Film, color: "bg-rose-50 text-rose-600" },
            { label: "PDF", value: pdfCount, icon: FileText, color: "bg-amber-50 text-amber-600" },
            { label: "Fenomena", value: phenomena.length, icon: BookOpen, color: "bg-cyan-50 text-cyan-600" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm sm:px-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.color}`}><Icon size={17} /></div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-slate-500 sm:text-xs">{stat.label}</p>
                  <p className="mt-0.5 text-xl font-extrabold leading-none text-slate-800">{loading ? "—" : stat.value.toLocaleString("id-ID")}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex shrink-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-800 sm:text-base">Daftar Materi</h2>
              <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">{loading ? "Memuat data materi..." : `${filteredMaterials.length} materi ditemukan`}</p>
            </div>

            <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
              {searchOpen && (
                <div className="relative order-first min-w-[140px] flex-1 sm:order-none sm:w-48 sm:flex-none">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input ref={searchRef} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} onKeyDown={(event) => { if (event.key === "Escape") { setSearch(""); setSearchOpen(false); setPage(1); } }} placeholder="Cari materi..." className="h-9 w-full rounded-xl border border-blue-200 bg-blue-50/50 pl-9 pr-8 text-xs outline-none transition focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100" />
                  <button type="button" onClick={() => { setSearch(""); setSearchOpen(false); setPage(1); }} aria-label="Tutup pencarian" className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={13} /></button>
                </div>
              )}

              {filterOpen && (
                <>
                  <select aria-label="Filter kategori" value={categoryFilter} onChange={(event) => changeCategory(event.target.value)} className="h-9 min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:max-w-[150px]">
                    <option value="ALL">Semua kategori</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.emoji ? `${category.emoji} ` : ""}{category.name}</option>)}
                  </select>
                  <select aria-label="Filter fenomena" value={phenomenonFilter} onChange={(event) => changePhenomenon(event.target.value)} className="h-9 min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:max-w-[160px]">
                    <option value="ALL">Semua fenomena</option>
                    {availablePhenomena.map((phenomenon) => <option key={phenomenon.id} value={phenomenon.id}>{phenomenon.title}</option>)}
                  </select>
                  <select aria-label="Filter tipe materi" value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value as TypeFilter); setPage(1); }} className="h-9 min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="ALL">Semua tipe</option>
                    <option value="VIDEO">Video</option>
                    <option value="PPT">PDF</option>
                  </select>
                </>
              )}

              <button type="button" onClick={() => { setFilterOpen((current) => !current); setSearchOpen(false); }} aria-label="Filter materi" title="Filter materi" aria-expanded={filterOpen} className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${filterOpen || categoryFilter !== "ALL" || phenomenonFilter !== "ALL" || typeFilter !== "ALL" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}>
                <SlidersHorizontal size={16} />
                {(categoryFilter !== "ALL" || phenomenonFilter !== "ALL" || typeFilter !== "ALL") && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600" />}
              </button>

              <button type="button" onClick={() => { setSearchOpen((current) => !current); setFilterOpen(false); }} aria-label="Cari materi" title="Cari materi" aria-expanded={searchOpen} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${searchOpen ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}>
                <Search size={16} />
              </button>

              {hasFilters && <button type="button" onClick={resetFilters} title="Reset pencarian dan filter" aria-label="Reset pencarian dan filter" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"><RotateCcw size={15} /></button>}
            </div>
          </div>

          {error && (
            <div className="mb-3 flex shrink-0 items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              <CircleAlert size={15} className="mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1">{error}</span>
              <button type="button" onClick={() => setError("")} aria-label="Tutup pesan" className="rounded-md p-0.5 hover:bg-rose-100"><X size={14} /></button>
            </div>
          )}

          {notice && !error && (
            <div className="mb-3 flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
              <CircleCheck size={15} className="shrink-0" />
              <span className="min-w-0 flex-1">{notice}</span>
              <button type="button" onClick={() => setNotice("")} aria-label="Tutup notifikasi" className="rounded-md p-0.5 hover:bg-emerald-100"><X size={14} /></button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            {loading ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-slate-400">
                <LoaderCircle size={27} className="animate-spin text-blue-500" />
                <p className="text-xs">Memuat daftar materi...</p>
              </div>
            ) : paginatedMaterials.length === 0 ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-400"><BookOpen size={25} /></div>
                <p className="mt-3 text-sm font-bold text-slate-700">{hasFilters ? "Materi tidak ditemukan" : "Belum ada materi"}</p>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">{hasFilters ? "Coba ubah kata kunci atau filter pencarian." : "Tambahkan materi PDF atau video untuk mulai mengisi pembelajaran."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedMaterials.map((item, index) => {
                  const phenomenon = getPhenomenon(item);
                  const category = getCategory(item);
                  const isVideo = item.type === "VIDEO";

                  return (
                    <article key={item.id} className="group relative flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-3 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-900/5 sm:p-3.5">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`flex h-[92px] w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-xl ${isVideo ? "bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 text-rose-500" : "bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 text-blue-500"}`}>
                          {isVideo ? (
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                              <Film size={30} strokeWidth={1.7} />
                              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm"><Video size={13} /></span>
                            </div>
                          ) : (
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                              <FileText size={30} strokeWidth={1.7} />
                              <span className="absolute -bottom-1 -right-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[8px] font-extrabold tracking-wide text-white shadow-sm">PDF</span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-start justify-between gap-1.5">
                            <span className="inline-flex min-w-0 max-w-full items-center gap-1 truncate rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                              {category?.emoji && <span>{category.emoji}</span>}
                              <span className="truncate">{category?.name || "Tanpa kategori"}</span>
                            </span>

                            <div ref={openMenu === item.id ? menuRef : null} className="relative -mr-1 -mt-1 shrink-0" onClick={(event) => event.stopPropagation()}>
                              <button type="button" onClick={() => setOpenMenu((current) => current === item.id ? null : item.id)} aria-label={`Aksi untuk ${item.title}`} aria-expanded={openMenu === item.id} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${openMenu === item.id ? "bg-blue-50 text-blue-700" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}>
                                <MoreVertical size={17} />
                              </button>
                              {openMenu === item.id && (
                                <div className="absolute right-0 top-9 z-30 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl shadow-slate-900/10">
                                  <button type="button" onClick={() => handleEdit(item)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"><Pencil size={14} />Edit materi</button>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button type="button" onClick={() => { setOpenMenu(null); setDeleteTarget(item); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"><Trash2 size={14} />Hapus materi</button>
                                </div>
                              )}
                            </div>
                          </div>

                          <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-slate-800" title={item.title}>{item.title}</h3>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400" title={item.description ?? ""}>{item.description || "Tidak ada deskripsi materi."}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm"><BookOpen size={14} /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Fenomena</p>
                          <p className="truncate text-xs font-semibold text-slate-700" title={phenomenon?.title ?? ""}>{phenomenon?.title || "Fenomena tidak tersedia"}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <TypeBadge type={item.type} />
                        <span className="text-[10px] text-slate-400">{formatDate(item.updatedAt || item.createdAt)}</span>
                      </div>
                      <span className="sr-only">Nomor {index + 1} dari halaman {currentPage}</span>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="mt-3 flex shrink-0 flex-col justify-between gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center">
            <p className="text-[11px] text-slate-500">
              {filteredMaterials.length === 0 ? "Menampilkan 0 materi" : `Menampilkan ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredMaterials.length)} dari ${filteredMaterials.length} materi`}
            </p>

            <div className="flex items-center gap-1">
              <button type="button" disabled={currentPage <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Halaman sebelumnya" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} /></button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((number) => number === 1 || number === totalPages || Math.abs(number - currentPage) <= 1)
                .reduce<(number | "dots")[]>((result, number, index, array) => {
                  if (index > 0 && number - array[index - 1] > 1) result.push("dots");
                  result.push(number);
                  return result;
                }, [])
                .map((number, index) => number === "dots" ? (
                  <span key={`dots-${index}`} className="px-1 text-xs text-slate-400">…</span>
                ) : (
                  <button key={number} type="button" onClick={() => setPage(number)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${currentPage === number ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "text-slate-500 hover:bg-slate-100"}`}>{number}</button>
                ))}

              <button type="button" disabled={currentPage >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} aria-label="Halaman berikutnya" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={15} /></button>
            </div>
          </footer>
        </section>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setDeleteTarget(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Trash2 size={20} /></div>
              <div className="min-w-0 flex-1">
                <h3 id="delete-title" className="text-base font-bold text-slate-900">Hapus materi?</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">Materi <span className="font-semibold text-slate-700">“{deleteTarget.title}”</span> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Batal</button>
              <button type="button" disabled={deleting} onClick={() => void handleDelete()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
                {deleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? "Menghapus..." : "Ya, hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
