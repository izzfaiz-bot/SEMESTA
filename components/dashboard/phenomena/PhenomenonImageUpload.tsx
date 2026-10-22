// components/dashboard/phenomena/PhenomenonImageUpload.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2, Upload, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File | null) => void;
  disabled?: boolean;
};

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function PhenomenonImageUpload({
  value,
  onChange,
  onFileChange,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!previewRef.current) setPreview(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function handleSelect(file?: File) {
    if (!file || disabled) return;
    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Gunakan gambar JPG, PNG, atau WebP.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Ukuran gambar maksimal 5 MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);

    const localPreview = URL.createObjectURL(file);
    previewRef.current = localPreview;
    setPreview(localPreview);
    onFileChange?.(file);
    onChange(value);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    if (disabled) return;

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreview("");
    onFileChange?.(null);
    onChange("");
    setError("");
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(event) => handleSelect(event.target.files?.[0])}
      />

      {preview ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview gambar fenomena"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-700">
              Gambar fenomena
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {previewRef.current
                ? "Preview lokal · Belum disimpan"
                : "Gambar tersimpan"}
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 disabled:opacity-50"
            >
              <Upload size={14} />
              Ganti gambar
            </button>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={handleRemove}
            aria-label="Hapus gambar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-left transition hover:border-sky-400 hover:bg-sky-50/50 disabled:opacity-50"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-600">
            <ImagePlus size={21} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-slate-700">
              Pilih gambar
            </span>
            <span className="mt-1 block text-xs text-slate-400">
              JPG, PNG, atau WebP · Maksimal 5 MB
            </span>
          </span>
          <Upload size={17} className="text-slate-400" />
        </button>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700"
        >
          <X size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}