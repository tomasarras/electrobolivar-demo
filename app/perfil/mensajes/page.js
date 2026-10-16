"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Store } from "lucide-react";

export default function PerfilMensajesPage() {
  const [threads, setThreads] = useState(null);

  useEffect(() => {
    fetch("/api/chat/threads")
      .then((res) => res.json())
      .then(setThreads);
  }, []);

  if (!threads) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Mensajes</h1>
      <p className="mt-1 text-sm text-ink-soft">Las charlas que tuviste con vendedores.</p>

      {threads.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-md border border-dashed border-line p-12 text-center text-sm text-steel">
          <MessageSquare size={32} strokeWidth={1.3} />
          Todavía no tuviste ninguna charla con un vendedor.
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {threads.map((t) => (
            <li key={t.sellerId}>
              <Link
                href={`/perfil/mensajes/${t.sellerId}`}
                className="flex items-center gap-3 rounded-md border border-line bg-panel p-3 hover:border-steel"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-paper">
                  <Store size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{t.storeName}</p>
                    {t.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-ink">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-ink-soft">{t.lastMessage}</p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-steel">
                  {new Date(t.lastAt).toLocaleDateString("es-AR", { dateStyle: "short" })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
