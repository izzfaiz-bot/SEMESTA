// components/phenomena/VideoPlayer.tsx
"use client";

import { useState } from "react";
import { Play, PlayCircle, ListVideo, VideoOff } from "lucide-react";

type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  url: string;
};

type VideoPlayerProps = {
  videos: VideoItem[];
};

type VideoSource =
  | { type: "youtube"; src: string; provider: string }
  | { type: "drive"; src: string; provider: string }
  | { type: "direct"; src: string; provider: string }
  | { type: "unsupported"; provider: string };

function getVideoSource(url: string): VideoSource {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { type: "unsupported", provider: "" };
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    // YouTube
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
      let videoId = "";

      if (host === "youtu.be") {
        videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
      } else if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v") ?? "";
      } else {
        const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]+)/);
        videoId = match?.[1] ?? "";
      }

      if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return {
          type: "youtube",
          src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
          provider: "YouTube",
        };
      }

      return { type: "unsupported", provider: "YouTube" };
    }

    // Google Drive: /file/d/FILE_ID/view atau /file/d/FILE_ID/preview
    if (host === "drive.google.com") {
      const match = parsed.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/);
      const fileId = match?.[1];

      if (fileId) {
        return {
          type: "drive",
          src: `https://drive.google.com/file/d/${fileId}/preview`,
          provider: "Google Drive",
        };
      }

      return { type: "unsupported", provider: "Google Drive" };
    }

    // Berkas video langsung
    if (/\.(mp4|webm|ogg|ogv|m4v)$/i.test(parsed.pathname)) {
      return { type: "direct", src: parsed.href, provider: "Video langsung" };
    }

    return { type: "unsupported", provider: "Sumber eksternal" };
  } catch {
    return { type: "unsupported", provider: "" };
  }
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  const [activeId, setActiveId] = useState(videos[0]?.id ?? "");
  const activeVideo = videos.find((video) => video.id === activeId) ?? videos[0];

  if (!activeVideo) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center text-center">
        <PlayCircle size={42} className="mb-3 text-cyan-300" />
        <p className="font-semibold text-white">Belum ada video pembelajaran</p>
        <p className="mt-1 text-sm text-slate-400">
          Materi video akan tersedia di sini.
        </p>
      </div>
    );
  }

  const source = getVideoSource(activeVideo.url);

  return (
    <section className="grid h-full min-h-0 w-full grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5">
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#030914] shadow-xl shadow-cyan-950/20">
          <div className="relative aspect-video max-h-full w-full">
            {source.type === "direct" && (
              <video
                key={activeVideo.id}
                src={source.src}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                className="absolute inset-0 h-full w-full bg-black object-contain"
              >
                Browser kamu tidak mendukung pemutaran video.
              </video>
            )}

            {source.type === "youtube" && (
              <iframe
                key={activeVideo.id}
                src={source.src}
                title={activeVideo.title}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )}

            {source.type === "drive" && (
              <iframe
                key={activeVideo.id}
                src={source.src}
                title={activeVideo.title}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )}

            {source.type === "unsupported" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                <VideoOff size={38} className="mb-3 text-cyan-300" />
                <p className="font-semibold text-white">
                  Video belum dapat diputar
                </p>
                <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
                  Format URL belum didukung. Gunakan tautan video YouTube,
                  Google Drive, atau berkas video langsung yang valid.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 pt-3 sm:pt-4">
          <div className="mb-1.5 inline-flex items-center gap-2 text-[10px] font-semibold tracking-widest text-cyan-300 sm:text-xs">
            <PlayCircle size={14} />
            MATERI PEMBELAJARAN
          </div>

          <h2 className="line-clamp-2 text-base font-bold leading-snug text-white sm:text-xl">
            {activeVideo.title}
          </h2>

          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
            {activeVideo.description || "Belum ada deskripsi untuk video ini."}
          </p>

          <p className="mt-2 text-[10px] text-slate-500 sm:text-xs">
            Sumber: {source.provider || "Tidak diketahui"}
          </p>
        </div>
      </div>

      <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]/80">
        <div className="shrink-0 border-b border-white/[0.08] p-3 sm:p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <ListVideo size={19} />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white sm:text-base">
                Daftar video
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilih materi pembelajaran
              </p>
            </div>

            <span className="ml-auto rounded-lg bg-white/[0.07] px-2 py-1 text-xs text-slate-300">
              {videos.length}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2.5 [scrollbar-width:thin] sm:p-3">
          {videos.map((video, index) => {
            const isActive = video.id === activeVideo.id;
            const videoSource = getVideoSource(video.url);
            const playable = videoSource.type !== "unsupported";

            return (
              <button
                key={video.id}
                type="button"
                onClick={() => setActiveId(video.id)}
                aria-pressed={isActive}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition active:scale-[0.99] ${
                  isActive
                    ? "border-cyan-400/30 bg-cyan-400/[0.08]"
                    : "border-white/[0.05] bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.05]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-white/[0.07] text-slate-300"
                  }`}
                >
                  {isActive ? (
                    <Play size={16} fill="currentColor" />
                  ) : (
                    <PlayCircle size={19} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-500">
                    VIDEO {String(index + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`block text-sm font-medium leading-5 ${
                      isActive ? "text-cyan-200" : "text-slate-200"
                    }`}
                  >
                    {video.title}
                  </span>

                  <span className="mt-1 block text-[11px] text-slate-500">
                    {playable ? "Materi tersedia" : "Format tidak didukung"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </section>
  );
}