"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function PerfilNotificacionesPage() {
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    fetch("/api/profile/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []));
    fetch("/api/profile/notifications", { method: "POST" }).catch(() => {});
  }, []);

  if (!notifications) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Notificaciones</h1>
      <p className="mt-1 text-sm text-ink-soft">Novedades sobre tus compras.</p>

      {notifications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-md border border-dashed border-line p-12 text-center text-sm text-steel">
          <Bell size={32} strokeWidth={1.3} />
          Todavía no tenés notificaciones.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {notifications.map((n) => (
            <li key={n.id} className="rounded-md border border-line bg-panel p-4">
              <p className="text-sm font-medium">{n.message}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="font-mono text-[11px] text-steel">
                  {new Date(n.createdAt).toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" })}
                </p>
                {n.orderId && (
                  <Link href="/perfil/compras" className="text-xs font-semibold text-ink underline-offset-2 hover:underline">
                    Ver pedido
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
