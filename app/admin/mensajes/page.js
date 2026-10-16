"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Trash2, ChevronDown, ChevronUp, Store, Phone, Mail, TriangleAlert } from "lucide-react";

export default function AdminMensajesPage() {
  const [messages, setMessages] = useState(null);
  const [openId, setOpenId] = useState(null);

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
        Quejas y consultas de clientes sobre algún producto, y mensajes de vendedores. Abrí uno para ver y contactar
        al vendedor involucrado.
      </p>

      {messages.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-md border border-dashed border-line p-12 text-center text-sm text-steel">
          <MessageSquare size={32} strokeWidth={1.3} />
          Todavía no hay mensajes.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {messages.map((m) => {
            const open = openId === m.id;
            return (
              <li key={m.id} className="relative rounded-md border border-line bg-panel">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : m.id)}
                  className="w-full p-4 text-left"
                >
                  {!m.read && (
                    <span className="absolute right-10 top-4 h-2 w-2 rounded-full bg-accent" title="No leído" />
                  )}
                  <div className="flex items-start justify-between gap-3 pr-10">
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
                      {m.productName && (
                        <p className="text-xs text-steel">
                          Sobre: {m.productName}
                          {!m.productId && " (eliminado)"}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-[10px] text-steel">
                        {new Date(m.createdAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      {open ? <ChevronUp size={16} className="text-steel" /> : <ChevronDown size={16} className="text-steel" />}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">{m.body}</p>
                </button>

                {open && (
                  <div className="space-y-3 border-t border-line px-4 pb-4 pt-3">
                    {m.seller ? (
                      <div className="rounded-md border border-line bg-panel-2 p-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-steel">
                          <Store size={13} />
                          Vendedor involucrado
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
                          {m.seller.storeName}
                          {m.seller.flaggedFraud && (
                            <span title="Marcado como posible fraude">
                              <TriangleAlert size={13} className="text-danger" />
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
                          <Link
                            href={`/tienda/vendedores/${m.seller.id}`}
                            target="_blank"
                            className="underline-offset-2 hover:text-accent hover:underline"
                          >
                            Ver perfil público
                          </Link>
                          {m.seller.whatsapp && (
                            <a
                              href={`https://wa.me/${m.seller.whatsapp}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 underline-offset-2 hover:text-accent hover:underline"
                            >
                              <Phone size={12} />
                              WhatsApp
                            </a>
                          )}
                          {m.seller.user?.email && (
                            <a
                              href={`mailto:${m.seller.user.email}`}
                              className="flex items-center gap-1 underline-offset-2 hover:text-accent hover:underline"
                            >
                              <Mail size={12} />
                              {m.seller.user.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : m.about === "soporte" ? (
                      <p className="text-xs text-steel">Mensaje enviado directamente por el vendedor, sin producto asociado.</p>
                    ) : (
                      <p className="text-xs text-steel">No hay un vendedor asociado a este mensaje (producto vendido por la tienda, o ya eliminado).</p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      className="flex items-center gap-1 text-xs text-steel hover:text-danger"
                    >
                      <Trash2 size={12} />
                      Eliminar mensaje
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
