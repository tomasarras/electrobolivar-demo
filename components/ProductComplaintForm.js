"use client";

import { useEffect, useRef, useState } from "react";
import { Ban, Loader2 } from "lucide-react";

export default function ProductComplaintForm({ productId, hasSeller, size = 40 }) {
  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState("producto");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) {
      setError("Escribí tu mensaje.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, about, name: name.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error("No se pudo enviar el mensaje");
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Reportar un problema"
        style={{ height: size, width: size }}
        className="flex items-center justify-center rounded-md border border-line bg-panel text-ink-soft hover:border-steel hover:text-danger"
      >
        <Ban size={size * 0.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-md border border-line bg-panel p-4 shadow-lg">
          {sent ? (
            <p className="text-sm text-ink-soft">Gracias, tu mensaje fue enviado al administrador.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm font-semibold">Reportar un problema</p>
              {hasSeller && (
                <select value={about} onChange={(e) => setAbout(e.target.value)} className="input">
                  <option value="producto">Es sobre el producto</option>
                  <option value="vendedor">Es sobre el vendedor</option>
                </select>
              )}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre (opcional)"
                className="input"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Contanos qué pasó"
                className="input resize-y"
                required
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60"
                >
                  {sending && <Loader2 size={14} className="animate-spin" />}
                  Enviar
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold text-ink-soft hover:border-steel"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid var(--line);
          background: var(--paper);
          color: var(--ink);
          padding: 0.5rem 0.6rem;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
