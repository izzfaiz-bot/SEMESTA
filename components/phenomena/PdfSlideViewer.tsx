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

type Props = {
  src: string;
};

export default function PdfSlideViewer({ src }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageHeight, setPageHeight] = useState(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updatePageDimensions = useCallback(() => {
    const container = document.getElementById("pdf-viewer-content");
    if (container) {
      const height = container.clientHeight - 24;
      setPageHeight(Math.max(300, height));
    }
  }, []);

  useEffect(() => {
    updatePageDimensions();
    window.addEventListener("resize", updatePageDimensions);
    return () => window.removeEventListener("resize", updatePageDimensions);
  }, [updatePageDimensions]);

  // Pantau perubahan status fullscreen browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        setShowControls(true);
      }
      setTimeout(updatePageDimensions, 100);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [updatePageDimensions]);

  // Logika Auto-Hide Kursor & Tombol saat Fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleMouseMove = () => {
      setShowControls(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    };

    const currentContainer = containerRef.current;
    currentContainer?.addEventListener("mousemove", handleMouseMove);

    return () => {
      currentContainer?.removeEventListener("mousemove", handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("[Fullscreen] Gagal masuk mode layar penuh:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("[Fullscreen] Gagal keluar mode layar penuh:", err);
      });
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

  // Navigasi Keyboard (Panah Kiri & Kanan)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext]);

  return (
    <div
      ref={containerRef}
      className={`flex min-w-0 flex-col overflow-hidden bg-[#111c2c] select-none ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none cursor-default"
          : "relative h-full flex-1 rounded-xl min-h-[520px]"
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Tombol Fullscreen / Close digeser sedikit ke bawah dan ke kiri (top-4 right-4) */}
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
        className={`absolute top-4 right-4 z-30 inline-flex items-center justify-center rounded-lg border border-white/10 bg-[#0b192b]/85 p-2.5 text-cyan-300 backdrop-blur-md hover:bg-white/10 transition-all duration-300 ${
          isFullscreen && !showControls
            ? "opacity-0 pointer-events-none translate-y-[-10px]"
            : "opacity-100 translate-y-0"
        }`}
        title={isFullscreen ? "Tutup" : "Fullscreen"}
      >
        {isFullscreen ? <X size={18} /> : <Maximize2 size={16} />}
      </button>

      <div
        id="pdf-viewer-content"
        className="relative min-h-0 flex-1 overflow-hidden bg-[#111c2c] p-3 flex justify-center items-center"
      >
        {loading && !error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#111c2c]">
            <LoaderCircle size={30} className="animate-spin text-cyan-300" />
            <p className="text-sm text-slate-400">Memuat dokumen PDF...</p>
          </div>
        )}

        {error ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 px-5 text-center">
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
              setLoading(false);
              setError("");
            }}
            onLoadError={(err) => {
              console.error("[PDF] Gagal memuat:", err);
              setLoading(false);
              setError(err.message || "Gagal memuat dokumen PDF.");
            }}
            loading={null}
            error={null}
            className="flex justify-center items-center w-full h-full"
          >
            {Array.from({ length: pageCount }, (_, index) => {
              const currentPage = index + 1;
              const isActive = currentPage === pageNumber;

              return (
                <div
                  key={`page-${currentPage}`}
                  className={`w-full h-full flex justify-center items-center ${
                    isActive ? "flex" : "hidden"
                  }`}
                >
                  <Page
                    pageNumber={currentPage}
                    height={pageHeight}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-h-full object-contain rounded-lg shadow-xl pointer-events-none"
                  />
                </div>
              );
            })}
          </Document>
        )}
      </div>
    </div>
  );
}