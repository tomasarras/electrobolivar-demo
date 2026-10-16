"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Loader2, User, X } from "lucide-react";

const PROVINCE = "Buenos Aires";

export default function PerfilPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setName(data.name || "");
        setEmail(data.email || "");
        setImage(data.image || "");
        setLocality(data.locality || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir la foto");
      setImage(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province: PROVINCE, locality, address, phone, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el perfil");
      await updateSession({ image: data.image || null });
      router.push("/tienda");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-steel">Cargando…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Mis datos</h1>
      <p className="mt-1 text-sm text-ink-soft">{name ? `${name} · ` : ""}{email}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <Field label="Foto de perfil (opcional)">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-panel-2 text-steel">
              {image ? (
                <Image src={image} alt="" fill className="object-cover" sizes="64px" />
              ) : (
                <User size={28} />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-semibold hover:border-steel">
                {uploadingPhoto ? <Loader2 size={13} className="animate-spin" /> : null}
                {image ? "Cambiar foto" : "Subir foto"}
                <input type="file" accept="image/*" className="hidden" disabled={uploadingPhoto} onChange={handlePhotoChange} />
              </label>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="inline-flex w-fit items-center gap-1 text-xs text-ink-soft hover:text-danger"
                >
                  <X size={12} />
                  Quitar foto
                </button>
              )}
            </div>
          </div>
        </Field>

        <Field label="Provincia">
          <p className="rounded-md border border-line bg-panel-2 px-3 py-2 text-sm text-ink-soft">{PROVINCE}</p>
        </Field>

        <Field label="Localidad">
          <input
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="Bolívar"
            className="input"
          />
        </Field>

        <Field label="Dirección">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle y número"
            className="input"
          />
        </Field>

        <Field label="Contacto (teléfono o WhatsApp)">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="2314 572888"
            inputMode="tel"
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Guardar datos
        </button>
      </form>

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
