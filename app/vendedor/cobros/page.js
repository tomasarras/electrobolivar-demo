"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function VendedorCobrosPage() {
  const [loaded, setLoaded] = useState(false);
  const [payoutBank, setPayoutBank] = useState("");
  const [payoutHolderName, setPayoutHolderName] = useState("");
  const [payoutHolderDni, setPayoutHolderDni] = useState("");
  const [payoutCbu, setPayoutCbu] = useState("");
  const [payoutAlias, setPayoutAlias] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/seller")
      .then((res) => res.json())
      .then((seller) => {
        setPayoutBank(seller?.payoutBank || "");
        setPayoutHolderName(seller?.payoutHolderName || "");
        setPayoutHolderDni(seller?.payoutHolderDni || "");
        setPayoutCbu(seller?.payoutCbu || "");
        setPayoutAlias(seller?.payoutAlias || "");
        setLoaded(true);
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/seller", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutBank, payoutHolderName, payoutHolderDni, payoutCbu, payoutAlias }),
      });
      if (!res.ok) throw new Error("No se pudieron guardar los datos");
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Datos de cobro</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Dónde querés recibir el dinero de tus ventas. Solo lo ve la administración, nunca tus compradores.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-3">
        <Field label="Banco">
          <input
            value={payoutBank}
            onChange={(e) => setPayoutBank(e.target.value)}
            placeholder="Banco Nación"
            className="input"
          />
        </Field>
        <Field label="Titular de la cuenta">
          <input
            value={payoutHolderName}
            onChange={(e) => setPayoutHolderName(e.target.value)}
            placeholder="Nombre y apellido"
            className="input"
          />
        </Field>
        <Field label="CUIT / CUIL / DNI del titular">
          <input
            value={payoutHolderDni}
            onChange={(e) => setPayoutHolderDni(e.target.value)}
            placeholder="20-12345678-9"
            className="input"
          />
        </Field>
        <Field label="CBU / CVU">
          <input
            value={payoutCbu}
            onChange={(e) => setPayoutCbu(e.target.value)}
            placeholder="0000003100094567892312"
            inputMode="numeric"
            className="input"
          />
        </Field>
        <Field label="Alias">
          <input
            value={payoutAlias}
            onChange={(e) => setPayoutAlias(e.target.value)}
            placeholder="mi.alias.mp"
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm text-accent-2">Datos guardados.</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Guardar
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
