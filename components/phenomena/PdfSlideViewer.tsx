// components/phenomena/PdfSlideViewer.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  FileWarning,
  LoaderCircle,
  Maximize2,
  X,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type Props = { src: string };

export default function PdfSlideViewer({ src }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageHeight, setPageHeight] = useState(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePageDimensions = useCallback(() => {
    const container = containerRef.current?.querySelector<HTMLElement>(
      "#pdf-viewer-content",
    );

    if (!container) return;

    const isMobile = window.innerWidth < 640;
    const padding = isMobile ? 16 : 24;
    const availableWidth = Math.max(100, container.clientWidth - padding);
    const availableHeight = Math.max(100, container.clientHeight - padding);

    // Batasi ukuran slide ke rasio 16:9 di mobile.
    // Tinggi juga dibatasi agar seluruh slide tetap masuk ke area PDF.
    const targetHeight = isMobile
      ? Math.min(availableHeight, (availableWidth * 9) / 16)
      : availableHeight;

    setPageHeight(Math.max(100, targetHeight));
  }, []);

  useEffect(() => {
    updatePageDimensions();

    const container = containerRef.current;
    const observer = new ResizeObserver(updatePageDimensions);

    if (container) observer.observe(container);

    window.addEventListener("resize", updatePageDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePageDimensions);
    };
  }, [updatePageDimensions]);

  // Pantau perubahan fullscreen.
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = document.fullscreenElement === containerRef.current;
      setIsFullscreen(isFull);
      setShowControls(true);

      if (!document.fullscreenElement) {
        screen.orientation?.unlock?.();
      }

      setTimeout(updatePageDimensions, 150);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [updatePageDimensions]);

  // Sembunyikan kontrol setelah tidak ada aktivitas saat fullscreen.
  useEffect(() => {
    if (!isFullscreen) return;

    const container = containerRef.current;
    if (!container) return;

    const handleActivity = () => {
      setShowControls(true);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    };

    container.addEventListener("mousemove", handleActivity);
    container.addEventListener("touchstart", handleActivity, {
      passive: true,
    });

    return () => {
      container.removeEventListener("mousemove", handleActivity);
      container.removeEventListener("touchstart", handleActivity);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();

        try {
          await screen.orientation?.lock?.("landscape");
        } catch {
          // Tidak semua perangkat atau browser mendukung kunci orientasi.
        }

        setShowControls(true);
        setTimeout(updatePageDimensions, 150);
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("[Fullscreen] Gagal mengubah mode layar:", err);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setPageCount(0);
    setPageNumber(1);
    setReloadKey((key) => key + 1);
  };

  const handlePrevious = useCallback(() => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setPageNumber((prev) => Math.min(pageCount, prev + 1));
  }, [pageCount]);

  // Navigasi keyboard.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (event.target as HTMLElement)?.tagName,
        )
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext]);

  // Navigasi swipe untuk smartphone.
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;

    const touch = event.changedTouches[0];
    if (!start || !touch || loading || error || pageCount < 2) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return;
    }

    if (deltaX < 0) handleNext();
    else handlePrevious();
  };

  const controlsVisible = !isFullscreen || showControls;

  return (
    <div
      ref={containerRef}
      className={`relative flex min-w-0 flex-col overflow-hidden bg-[#111c2c] select-none ${
        isFullscreen
          ? "fixed inset-0 z-50 h-dvh w-screen rounded-none"
          : "relative h-full min-h-0 min-w-0 flex-1 rounded-xl"
      }`}
      onContextMenu={(event) => event.preventDefault()}
    >
      {/* Tombol fullscreen */}
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Keluar fullscreen" : "Fullscreen"}
        title={isFullscreen ? "Keluar fullscreen" : "Fullscreen"}
        className={`absolute right-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0b192b]/90 text-cyan-300 shadow-lg backdrop-blur-md transition-all duration-300 sm:right-4 sm:top-4 ${
          controlsVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {isFullscreen ? <X size={18} /> : <Maximize2 size={17} />}
      </button>

      {/* Area PDF */}
      <div
        id="pdf-viewer-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#111c2c] p-2 sm:p-3"
        style={{ touchAction: "pan-y" }}
      >
        {loading && !error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#111c2c]">
            <LoaderCircle size={30} className="animate-spin text-cyan-300" />
            <p className="text-xs text-slate-400 sm:text-sm">
              Memuat dokumen PDF...
            </p>
          </div>
        )}

        {error ? (
          <div className="flex min-h-0 flex-col items-center justify-center gap-3 px-5 text-center">
            <FileWarning size={36} className="text-rose-300" />
            <h3 className="font-semibold text-white">
              PDF tidak dapat ditampilkan
            </h3>
            <p className="max-w-sm text-sm text-slate-400">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-cyan-300 hover:bg-white/5"
            >
              Muat ulang
            </button>
          </div>
        ) : (
          <Document
            key={`${src}-${reloadKey}`}
            file={src}
            onLoadSuccess={({ numPages }) => {
              console.log("[PDF] Jumlah halaman:", numPages);
              setPageCount(numPages);
              setPageNumber(1);
              setLoading(false);
              setError("");
              requestAnimationFrame(updatePageDimensions);
            }}
            onLoadError={(err) => {
              console.error("[PDF] Gagal memuat:", err);
              setLoading(false);
              setError(err.message || "Gagal memuat dokumen PDF.");
            }}
            loading={null}
            error={null}
            className="flex h-full w-full items-center justify-center"
          >
            {Array.from({ length: pageCount }, (_, index) => {
              const currentPage = index + 1;
              const isActive = currentPage === pageNumber;

              return (
                <div
                  key={`page-${currentPage}`}
                  className={`flex h-full w-full items-center justify-center ${
                    isActive ? "" : "hidden"
                  }`}
                >
                  <Page
                    pageNumber={currentPage}
                    height={pageHeight}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="rounded-lg object-contain shadow-xl pointer-events-none"
                  />
                </div>
              );
            })}
          </Document>
        )}

        {/* Tombol slide sebelumnya */}
        {!loading && !error && pageCount > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            disabled={pageNumber <= 1}
            aria-label="Slide sebelumnya"
            title="Slide sebelumnya"
            className={`absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0b192b]/90 text-white shadow-lg backdrop-blur-md transition-all hover:border-cyan-300/50 hover:bg-cyan-400/15 hover:text-cyan-200 active:scale-90 sm:left-4 sm:h-12 sm:w-12 ${
              controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
            } disabled:cursor-not-allowed disabled:opacity-30`}
          >
            <ChevronLeft size={25} />
          </button>
        )}

        {/* Tombol slide berikutnya */}
        {!loading && !error && pageCount > 1 && (
          <button
            type="button"
            onClick={handleNext}
            disabled={pageNumber >= pageCount}
            aria-label="Slide berikutnya"
            title="Slide berikutnya"
            className={`absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0b192b]/90 text-white shadow-lg backdrop-blur-md transition-all hover:border-cyan-300/50 hover:bg-cyan-400/15 hover:text-cyan-200 active:scale-90 sm:right-4 sm:h-12 sm:w-12 ${
              controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
            } disabled:cursor-not-allowed disabled:opacity-30`}
          >
            <ChevronRight size={25} />
          </button>
        )}
      </div>
    </div>
  );
}