"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, MapPin } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import { PROVINCIAS } from "@/lib/provincias";

export default function PerfilPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/perfil")}`);
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setName(data.name || "");
        setEmail(data.email || "");
        setProvince(data.province || "");
        setLocality(data.locality || "");
        setAddress(data.address || "");
      })
      .finally(() => setLoading(false));
  }, [status]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province, locality, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el perfil");
      setMessage("Perfil actualizado.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status !== "authenticated" || loading) {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-sm px-4 py-20 text-center sm:px-6">
          <p className="text-sm text-steel">Cargando…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-sm px-4 py-10 sm:px-6">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
          <MapPin size={22} className="text-accent" />
          Mi perfil
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{name ? `${name} · ` : ""}{email}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <Field label="Provincia">
            <select value={province} onChange={(e) => setProvince(e.target.value)} className="input">
              <option value="">Elegí tu provincia</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
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

          {error && <p className="text-sm text-danger">{error}</p>}
          {message && <p className="text-sm text-accent-2">{message}</p>}

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
      </main>
    </>
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
