"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, User } from "lucide-react";

export default function VendedorConsultasPage() {
  const [threads, setThreads] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/seller/chat/threads").then((res) => {
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      res.json().then((data) => setThreads(Array.isArray(data) ? data : []));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!threads) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Consultas</h1>
      <p className="mt-1 text-sm text-ink-soft">Charlas que iniciaron compradores con vos.</p>

      {threads.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-md border border-dashed border-line p-12 text-center text-sm text-steel">
          <MessageSquare size={32} strokeWidth={1.3} />
          Todavía no tenés consultas de compradores.
        </div>
      ) : (
        <ul className="mt-6 max-w-lg space-y-2">
          {threads.map((t) => (
            <li key={t.buyerId}>
              <Link
                href={`/vendedor/consultas/${t.buyerId}`}
                className="flex items-center gap-3 rounded-md border border-line bg-panel p-3 hover:border-steel"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-paper">
                  <User size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{t.buyerName}</p>
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
