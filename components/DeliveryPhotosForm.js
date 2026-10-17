"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";

const MAX_PHOTOS = 4;

export default function DeliveryPhotosForm({ orderItemId }) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        if (photos.length >= MAX_PHOTOS) break;
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo subir la foto");
        setPhotos((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url) {
    setPhotos((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit() {
    if (!photos.length) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/delivery-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId, urls: photos }),
      });
      if (!res.ok) throw new Error("No se pudieron guardar las fotos");
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <p className="text-xs text-accent-2">¡Gracias por compartir tus fotos!</p>;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-steel hover:text-ink"
      >
        <Camera size={13} />
        Subir fotos de cómo te llegó (opcional)
      </button>
    );
  }

  return (
    <div className="max-w-sm rounded-md border border-line bg-panel-2 p-3">
      <p className="text-xs font-semibold">Fotos de cómo te llegó el pedido</p>
      {photos.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {photos.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded border border-line">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute right-0.5 top-0.5 rounded-full bg-ink/70 p-0.5 text-paper opacity-0 group-hover:opacity-100"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      {photos.length < MAX_PHOTOS && (
        <label className="mt-2 flex cursor-pointer items-center gap-1.5 text-xs text-steel hover:text-ink">
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
          {uploading ? "Subiendo…" : "Agregar foto"}
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" disabled={uploading} />
        </label>
      )}
      {error && <p className="mt-1.5 text-[11px] text-danger">{error}</p>}
      <div className="mt-2 flex gap-1.5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!photos.length || submitting || uploading}
          className="flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:brightness-110 disabled:opacity-50"
        >
          {submitting && <Loader2 size={12} className="animate-spin" />}
          Publicar
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-steel"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
