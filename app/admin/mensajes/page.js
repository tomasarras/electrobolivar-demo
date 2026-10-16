"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Trash2 } from "lucide-react";

export default function AdminMensajesPage() {
  const [messages, setMessages] = useState(null);

  function load() {
    fetch("/api/admin/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (messages && messages.some((m) => !m.read)) {
      fetch("/api/admin/messages", { method: "POST" }).catch(() => {});
    }
  }, [messages]);

  async function handleDelete(id) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" }).catch(() => {});
  }

  if (!messages) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Mensajes</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Quejas y consultas de clientes sobre algún producto, y mensajes de vendedores.
      </p>

      {messages.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-md border border-dashed border-line p-12 text-center text-sm text-steel">
          <MessageSquare size={32} strokeWidth={1.3} />
          Todavía no hay mensajes.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="relative rounded-md border border-line bg-panel p-4">
              {!m.read && (
                <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-accent" title="No leído" />
              )}
              <div className="flex items-start justify-between gap-3 pr-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{m.name || "Anónimo"}</p>
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                        m.about === "vendedor"
                          ? "bg-danger/10 text-danger"
                          : m.about === "soporte"
                            ? "bg-accent/10 text-accent-2"
                            : "bg-panel-2 text-steel"
                      }`}
                    >
                      {m.about === "vendedor" ? "Vendedor" : m.about === "soporte" ? "Consulta de vendedor" : "Producto"}
                    </span>
                  </div>
                  {m.productId ? (
                    <Link
                      href={`/producto/${m.productId}`}
                      target="_blank"
                      className="text-xs text-steel underline-offset-2 hover:text-accent hover:underline"
                    >
                      Sobre: {m.productName}
                    </Link>
                  ) : m.productName ? (
                    <p className="text-xs text-steel">Sobre: {m.productName} (eliminado)</p>
                  ) : null}
                </div>
                <span className="shrink-0 font-mono text-[10px] text-steel">
                  {new Date(m.createdAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{m.body}</p>
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                className="mt-3 flex items-center gap-1 text-xs text-steel hover:text-danger"
              >
                <Trash2 size={12} />
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
