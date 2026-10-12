"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

const POLL_MS = 20000;

export default function SellerNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
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
        className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ink-soft hover:bg-panel-2"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
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
              {notifications.map((n) => (
                <li key={n.id} className="px-3 py-2.5">
                  <p className="text-sm">{n.message}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-steel">
                    {new Date(n.createdAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
