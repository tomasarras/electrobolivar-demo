"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";

export default function ConfiguracionPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(true);
  const [alt, setAlt] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [desktopUrl, setDesktopUrl] = useState("");
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [addingPromo, setAddingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setWhatsapp(data.whatsapp || ""))
      .finally(() => setLoading(false));
    loadPromos();
  }, []);

  function loadPromos() {
    setPromosLoading(true);
    return fetch("/api/settings/promos")
      .then((res) => res.json())
      .then(setPromos)
      .finally(() => setPromosLoading(false));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setMessage("Contacto guardado.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadPromoImage(file, setUrl, setUploading) {
    setUploading(true);
    setPromoError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir la imagen");
      setUrl(data.url);
    } catch (err) {
      setPromoError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleAddPromo(e) {
    e.preventDefault();
    setPromoError("");
    if (!mobileUrl || !desktopUrl) {
      setPromoError("Subí las dos imágenes (mobile y escritorio) antes de agregar.");
      return;
    }
    setAddingPromo(true);
    try {
      const res = await fetch("/api/settings/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileUrl, desktopUrl, alt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo agregar la publicidad");
      setAlt("");
      setMobileUrl("");
      setDesktopUrl("");
      await loadPromos();
    } catch (err) {
      setPromoError(err.message);
    } finally {
      setAddingPromo(false);
    }
  }

  async function handleDeletePromo(id) {
    setPromos((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/settings/promos/${id}`, { method: "DELETE" });
  }

  if (loading) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold">Configuración</h1>
        <p className="mt-1 text-sm text-ink-soft">Este número recibe los pedidos que arman los clientes.</p>

        <form onSubmit={handleSave} className="mt-6 max-w-sm space-y-3">
          <label className="block font-mono text-[11px] uppercase tracking-wide text-steel">
            WhatsApp (código de país + número, sin +)
          </label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="5491122334455"
            inputMode="numeric"
            className="input"
          />
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Guardar contacto
          </button>
          {message && <p className="text-sm text-accent-2">{message}</p>}
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold">Publicidades</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Rotan cada 30 segundos en la tienda. Cada publicidad necesita dos imágenes con tamaño fijo:
          una para el cartel de abajo en celular y otra para el panel lateral en pantallas grandes.
        </p>

        {promosLoading ? (
          <p className="mt-4 text-sm text-steel">Cargando…</p>
        ) : (
          promos.length > 0 && (
            <div className="mt-4 space-y-3">
              {promos.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-md border border-line bg-panel p-2">
                  <div className="relative h-14 w-28 flex-shrink-0 overflow-hidden rounded border border-line">
                    <Image src={p.mobileUrl} alt="" fill className="object-cover" sizes="112px" />
                  </div>
                  <div className="relative h-14 w-8 flex-shrink-0 overflow-hidden rounded border border-line">
                    <Image src={p.desktopUrl} alt="" fill className="object-cover object-top" sizes="32px" />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm text-ink-soft">{p.alt}</p>
                  <button
                    type="button"
                    onClick={() => handleDeletePromo(p.id)}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-danger text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        <form onSubmit={handleAddPromo} className="mt-6 space-y-4 rounded-md border border-line bg-panel p-4">
          <Field label="Descripción (para accesibilidad, no se ve)">
            <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Reparación de aires acondicionados" className="input" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Imagen mobile (recomendado 960×240px)">
              <input
                type="file"
                accept="image/*"
                disabled={uploadingMobile}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) uploadPromoImage(file, setMobileUrl, setUploadingMobile);
                }}
              />
              {uploadingMobile && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-steel">
                  <Loader2 size={12} className="animate-spin" /> Subiendo…
                </p>
              )}
              {mobileUrl && !uploadingMobile && (
                <div className="relative mt-2 h-16 w-full overflow-hidden rounded border border-line">
                  <Image src={mobileUrl} alt="" fill className="object-cover" sizes="200px" />
                </div>
              )}
            </Field>
            <Field label="Imagen escritorio (recomendado 720×1280px, vertical)">
              <input
                type="file"
                accept="image/*"
                disabled={uploadingDesktop}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) uploadPromoImage(file, setDesktopUrl, setUploadingDesktop);
                }}
              />
              {uploadingDesktop && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-steel">
                  <Loader2 size={12} className="animate-spin" /> Subiendo…
                </p>
              )}
              {desktopUrl && !uploadingDesktop && (
                <div className="relative mt-2 h-24 w-16 overflow-hidden rounded border border-line">
                  <Image src={desktopUrl} alt="" fill className="object-cover object-top" sizes="100px" />
                </div>
              )}
            </Field>
          </div>

          {promoError && <p className="text-sm text-danger">{promoError}</p>}

          <button
            type="submit"
            disabled={addingPromo || uploadingMobile || uploadingDesktop}
            className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-60"
          >
            {addingPromo && <Loader2 size={14} className="animate-spin" />}
            Agregar publicidad
          </button>
        </form>
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
    </div>
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
