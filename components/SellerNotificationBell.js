"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const POLL_MS = 20000;

export default function SellerNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    function load() {
      fetch("/api/seller/notifications")
        .then((res) => res.json())
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const active = pathname.startsWith("/vendedor/notificaciones");

  return (
    <Link
      href="/vendedor/notificaciones"
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${active ? "bg-ink text-paper" : "hover:bg-panel-2"}`}
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
    </Link>
  );
}
