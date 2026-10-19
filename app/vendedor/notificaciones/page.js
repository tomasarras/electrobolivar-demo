"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, User, Phone, MapPin, StickyNote, MessageCircle } from "lucide-react";

const DELIVERY_LABELS = {
  envio: "Envío a domicilio",
  retiro: "Retiro en el local",
};

export default function VendedorNotificacionesPage() {
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    fetch("/api/seller/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []));
    fetch("/api/seller/notifications", { method: "POST" }).catch(() => {});
  }, []);

  if (!notifications) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Notificaciones</h1>
      <p className="mt-1 text-sm text-ink-soft">Todas tus ventas, con los datos del comprador para saber a dónde mandar el pedido.</p>

      {notifications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-md border border-dashed border-line p-12 text-center text-sm text-steel">
          <Bell size={32} strokeWidth={1.3} />
          Todavía no tenés ventas.
        </div>
      ) : (
        <ul className="mt-6 max-w-2xl space-y-3">
          {notifications.map((n) => {
            const order = n.order;
            return (
              <li key={n.id} className="rounded-md border border-line bg-panel p-4">
                <p className="text-sm font-medium">{n.message}</p>
                <p className="mt-0.5 font-mono text-[11px] text-steel">
                  {new Date(n.createdAt).toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" })}
                </p>

                {order && (
                  <div className="mt-3 space-y-1.5 rounded-md border border-line bg-panel-2 p-3 text-sm">
                    <p className="flex items-center gap-1.5">
                      <User size={13} className="shrink-0 text-steel" />
                      {order.buyer?.name || order.buyer?.email || "Comprador sin cuenta"}
                    </p>
                    {(order.contactPhone || order.buyer?.phone) && (
                      <p className="flex items-center gap-1.5 text-ink-soft">
                        <Phone size={13} className="shrink-0 text-steel" />
                        {order.contactPhone || order.buyer?.phone}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-ink-soft">
                      <MapPin size={13} className="shrink-0 text-steel" />
                      {DELIVERY_LABELS[order.deliveryMethod] || order.deliveryMethod}
                      {order.address ? ` — ${order.address}` : ""}
                    </p>
                    {order.deliveryNote && (
                      <p className="flex items-start gap-1.5 text-ink-soft">
                        <StickyNote size={13} className="mt-0.5 shrink-0 text-steel" />
                        {order.deliveryNote}
                      </p>
                    )}
                    {order.buyer?.id && (
                      <Link
                        href={`/vendedor/consultas/${order.buyer.id}`}
                        className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-ink underline-offset-2 hover:underline"
                      >
                        <MessageCircle size={13} />
                        Mandarle un mensaje al comprador (opcional)
                      </Link>
                    )}
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
