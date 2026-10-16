"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export default function VendedorMensajesPage() {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) {
      setError("Escribí tu mensaje.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/seller/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!res.ok) throw new Error("No se pudo enviar el mensaje");
      setSent(true);
      setBody("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Mandar mensaje al administrador</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Escribí tu consulta o reclamo y le va a llegar directo a la administración de la tienda.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-3">
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setSent(false);
          }}
          rows={5}
          placeholder="Contanos qué necesitás"
          className="input resize-y"
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {sent && <p className="text-sm text-accent-2">Mensaje enviado. Gracias.</p>}
        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enviar
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
