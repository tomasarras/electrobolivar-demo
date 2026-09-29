"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ConfiguracionPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setWhatsapp(data.whatsapp || ""))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <p className="text-sm text-steel">Cargando…</p>;

  return (
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
          className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm"
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
  );
}
