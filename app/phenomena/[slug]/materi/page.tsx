
// app/phenomena/[slug]/materi/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Presentation,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import MaterialPreview from "@/components/phenomena/MaterialPreview";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ material?: string }>;
};

function getMaterialSource(url: string, type: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;

    // Canva presentation.
    if (host === "canva.com" || host.endsWith(".canva.com")) {
      const canvaDesign = path.match(/\/design\/([^/]+)\/([^/]+)/);

      if (canvaDesign) {
        return `https://www.canva.com/design/${canvaDesign[1]}/${canvaDesign[2]}/view?embed`;
      }

      return url;
    }

    // Canva short link.
    if (host === "canva.link") {
      return url;
    }

    // Google Slides, Docs, and Sheets.
    if (host === "docs.google.com") {
      const slides = path.match(/\/presentation\/d\/([^/]+)/);

      if (slides) {
        return `https://docs.google.com/presentation/d/${slides[1]}/embed?start=false&loop=false&delayms=3000`;
      }

      const document = path.match(/\/document\/d\/([^/]+)/);

      if (document) {
        return `https://docs.google.com/document/d/${document[1]}/preview`;
      }

      const sheet = path.match(/\/spreadsheets\/d\/([^/]+)/);

      if (sheet) {
        return `https://docs.google.com/spreadsheets/d/${sheet[1]}/preview`;
      }
    }

    // Google Drive: use the server endpoint to retrieve the PDF.
    if (host === "drive.google.com") {
      const fileId =
        path.match(/\/file\/d\/([^/]+)/)?.[1] ??
        parsed.searchParams.get("id");

      if (fileId) {
        return `/api/materials/${encodeURIComponent(fileId)}/pdf`;
      }
    }

    // PowerPoint hosted at a direct URL.
    if (type === "PPT" && /\.(ppt|pptx)$/i.test(path)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    // Direct PDF or another supported URL.
    return url;
  } catch {
    return url;
  }
}

function getMaterialIcon(type: string) {
  return type === "PPT" ? Presentation : FileText;
}

function getMaterialLabel(type: string) {
  if (type === "PPT") return "Presentasi";
  if (type === "PDF") return "Dokumen PDF";
  return "Bahan pembelajaran";
}

export default async function MateriPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { material: materialId } = await searchParams;

  const phenomenon = await prisma.phenomenon.findFirst({
    where: {
      slug,
      isPublished: true,
      category: { isPublished: true },
    },
    select: {
      slug: true,
      title: true,
      materials: {
        where: {
          isPublished: true,
          type: { not: "VIDEO" },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          url: true,
        },
      },
    },
  });

  if (!phenomenon) notFound();

  const materials = phenomenon.materials;
  const selected =
    materials.find((item) => item.id === materialId) ?? materials[0];

  const previewUrl = selected
    ? getMaterialSource(selected.url, selected.type)
    : null;

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#07111f] text-slate-100">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.08] px-3 py-3 sm:px-5">
        <Link
          href={`/phenomena/${phenomenon.slug}`}
          aria-label="Kembali ke halaman fenomena"
          title="Kembali ke fenomena"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
        >
          <ArrowLeft size={19} />
        </Link>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <BookOpen size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.16em] text-cyan-300 sm:text-[10px]">
            <Sparkles size={11} />
            SEMESTA SCIENCE ADVENTURE
          </div>
          <h1 className="truncate text-sm font-bold text-white sm:text-base">
            {phenomenon.title}
          </h1>
        </div>

        <span className="hidden shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-slate-400 sm:inline-flex">
          Materi Pembelajaran
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:gap-4 sm:p-5 lg:flex-row">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          {selected && previewUrl ? (
            <div className="min-h-0 flex-1">
              <MaterialPreview
                slug={phenomenon.slug}
                materialId={selected.id}
                title={selected.title}
                src={previewUrl}
              />
            </div>
          ) : (
            <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-5 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <BookOpen size={28} />
              </div>
              <h2 className="text-base font-semibold text-white">
                Materi belum tersedia
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Materi PPT atau PDF untuk fenomena ini belum tersedia.
              </p>
            </div>
          )}
        </section>

        <aside className="flex max-h-[35dvh] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] lg:max-h-none lg:w-[300px]">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Daftar Materi
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Pilih materi untuk dipelajari
              </p>
            </div>
            <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
              {materials.length}
            </span>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {materials.map((item, index) => {
              const Icon = getMaterialIcon(item.type);
              const active = item.id === selected?.id;

              return (
                <Link
                  key={item.id}
                  href={`/phenomena/${phenomenon.slug}/materi?material=${encodeURIComponent(item.id)}`}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-start gap-3 rounded-xl border p-3 transition ${
                    active
                      ? "border-cyan-400/30 bg-cyan-400/[0.08]"
                      : "border-transparent bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.05]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      active
                        ? "bg-cyan-400/15 text-cyan-300"
                        : "bg-white/[0.06] text-slate-400 group-hover:text-cyan-300"
                    }`}
                  >
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Materi {index + 1}
                    </p>
                    <p
                      className={`break-words text-sm font-semibold leading-5 ${
                        active ? "text-cyan-200" : "text-slate-200"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {getMaterialLabel(item.type)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
