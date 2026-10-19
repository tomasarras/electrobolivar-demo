"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, MapPin, Phone, StickyNote, User } from "lucide-react";

const POLL_MS = 20000;

const DELIVERY_LABELS = {
  envio: "Envío a domicilio",
  retiro: "Retiro en el local",
};

export default function SellerNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const containerRef = useRef(null);

  function load() {
    fetch("/api/seller/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      setUnreadCount(0);
      fetch("/api/seller/notifications", { method: "POST" }).catch(() => {});
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-panel-2"
      >
        <span className="relative flex">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-ink">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
        <span className="hidden sm:inline">Notificaciones</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-md border border-line bg-panel shadow-lg">
          <div className="border-b border-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-steel">
            Notificaciones
          </div>
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-steel">Todavía no tenés ventas.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-line overflow-y-auto">
              {notifications.map((n) => {
                const order = n.order;
                const isOpen = openId === n.id;
                return (
                  <li key={n.id} className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : n.id)}
                      className="block w-full text-left"
                      disabled={!order}
                    >
                      <p className="text-sm">{n.message}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-steel">
                        {new Date(n.createdAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                        {order && <span className="ml-1.5 underline-offset-2 hover:underline">· ver comprador</span>}
                      </p>
                    </button>
                    {isOpen && order && (
                      <div className="mt-2 space-y-1.5 rounded-md border border-line bg-panel-2 p-2.5 text-xs">
                        <p className="flex items-center gap-1.5 text-ink">
                          <User size={12} className="shrink-0 text-steel" />
                          {order.buyer?.name || order.buyer?.email || "Comprador sin cuenta"}
                        </p>
                        {(order.contactPhone || order.buyer?.phone) && (
                          <p className="flex items-center gap-1.5 text-ink-soft">
                            <Phone size={12} className="shrink-0 text-steel" />
                            {order.contactPhone || order.buyer?.phone}
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 text-ink-soft">
                          <MapPin size={12} className="shrink-0 text-steel" />
                          {DELIVERY_LABELS[order.deliveryMethod] || order.deliveryMethod}
                          {order.address ? ` — ${order.address}` : ""}
                        </p>
                        {order.deliveryNote && (
                          <p className="flex items-start gap-1.5 text-ink-soft">
                            <StickyNote size={12} className="mt-0.5 shrink-0 text-steel" />
                            {order.deliveryNote}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
