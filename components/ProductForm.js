"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Loader2, X, Film } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

const MAX_IMAGES = 4;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export default function ProductForm({ product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || CATEGORIES[0].slug);
  const [price, setPrice] = useState(product?.price || "");
  const [installments, setInstallments] = useState(product?.installments || "");
  const [inStock, setInStock] = useState(product?.inStock !== false);
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl || "");
  const [description, setDescription] = useState(product?.description || "");
  const [images, setImages] = useState((product?.images || []).map((img) => img.url));
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        if (images.length >= MAX_IMAGES) break;
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo subir la imagen");
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleVideoFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      setError("El video no puede pesar más de 50MB.");
      return;
    }
    setUploadingVideo(true);
    setError("");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/video-upload",
      });
      setVideoUrl(blob.url);
    } catch (err) {
      setError(err.message || "No se pudo subir el video");
    } finally {
      setUploadingVideo(false);
    }
  }

  function removeVideo() {
    setVideoUrl("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        price: Number(price),
        installments: installments.trim(),
        inStock,
        videoUrl: videoUrl.trim(),
        description: description.trim(),
        images,
      };
      const res = await fetch(isEdit ? `/api/products/${product.id}` : "/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el producto");
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Field label="Nombre">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Heladera No Frost 320L"
          className="input"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Categoría">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Precio (ARS)">
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="input" required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Cuotas (opcional)">
          <input
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            placeholder="12 cuotas sin interés"
            className="input"
          />
        </Field>
        <Field label="Disponibilidad">
          <select value={inStock ? "true" : "false"} onChange={(e) => setInStock(e.target.value === "true")} className="input">
            <option value="true">En stock</option>
            <option value="false">Sin stock</option>
          </select>
        </Field>
      </div>

      <Field label={`Fotos (hasta ${MAX_IMAGES})`}>
        <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={uploading || images.length >= MAX_IMAGES} />
        {uploading && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-steel">
            <Loader2 size={12} className="animate-spin" /> Subiendo…
          </p>
        )}
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative h-16 w-16">
                <Image src={url} alt="" fill className="rounded border border-line object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white hover:brightness-95"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Field>

      <Field label="Video (opcional, hasta 50MB)">
        <input type="file" accept="video/*" onChange={handleVideoFile} disabled={uploadingVideo} />
        {uploadingVideo && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-steel">
            <Loader2 size={12} className="animate-spin" /> Subiendo…
          </p>
        )}
        {videoUrl && !uploadingVideo && (
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
            <Film size={16} />
            <span>Video cargado</span>
            <button type="button" onClick={removeVideo} className="text-danger hover:underline">
              Quitar
            </button>
          </div>
        )}
      </Field>

      <Field label="Descripción breve">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input resize-y"
          placeholder="Motivo por el que un cliente lo elegiría"
        />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Guardar cambios" : "Agregar producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft hover:border-steel"
        >
          Cancelar
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--ink);
          padding: 0.55rem 0.65rem;
          font-size: 0.9rem;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-steel">{label}</label>
      {children}
    </div>
  );
}
