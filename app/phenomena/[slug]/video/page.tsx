// app/phenomena/[slug]/video/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PlayCircle, Video, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import VideoPlayer from "@/components/phenomena/VideoPlayer";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function VideoPage({ params }: PageProps) {
  const { slug } = await params;

  const phenomenon = await prisma.phenomenon.findFirst({
    where: {
      slug,
      isPublished: true,
      category: { isPublished: true },
    },
    select: {
      title: true,
      slug: true,
      materials: {
        where: { type: "VIDEO", isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          url: true,
        },
      },
    },
  });

  if (!phenomenon) notFound();

  const videos = phenomenon.materials;

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
          <PlayCircle size={21} />
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
          Video Pembelajaran
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
        {videos.length > 0 ? (
          <VideoPlayer videos={videos} />
        ) : (
          <section className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-5 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <Video size={28} />
            </div>

            <h2 className="text-base font-semibold text-white sm:text-lg">
              Video belum tersedia
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Materi video untuk fenomena ini belum tersedia. Silakan kunjungi
              kembali halaman ini nanti.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}