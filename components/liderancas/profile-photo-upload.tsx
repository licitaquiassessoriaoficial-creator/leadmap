"use client";

import { type ChangeEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function ProfilePhotoUpload({
  value,
  onChange,
  title = "Foto de perfil",
  placeholder = "Foto",
  alt = "Foto de perfil",
  previewClassName = "h-20 w-20 rounded-2xl object-cover shadow-sm",
  placeholderClassName = "h-20 w-20 rounded-2xl"
}: {
  value?: string;
  onChange: (value?: string) => void;
  title?: string;
  placeholder?: string;
  alt?: string;
  previewClassName?: string;
  placeholderClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        data?: { url: string };
      };

      if (!response.ok || !payload.data?.url) {
        setError(payload.error ?? "Não foi possível enviar a imagem.");
        return;
      }

      onChange(payload.data.url);
    } catch {
      setError("Não foi possível enviar a imagem.");
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <div className="flex items-center gap-4">
        {value ? (
          <img
            src={value}
            alt={alt}
            className={previewClassName}
          />
        ) : (
          <div
            className={`flex items-center justify-center bg-slate-200 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ${placeholderClassName}`}
          >
            {placeholder}
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">
            JPG, PNG ou WEBP com até 5 MB.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Enviando..." : value ? "Trocar foto" : "Enviar foto"}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange(undefined)}
              >
                Remover
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
