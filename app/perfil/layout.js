"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MapPin, Package, MessageSquare, Bell } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";

const NAV = [
  { href: "/perfil", label: "Mis datos", icon: MapPin },
  { href: "/perfil/compras", label: "Mis compras", icon: Package },
  { href: "/perfil/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/perfil/mensajes", label: "Mensajes", icon: MessageSquare },
];

export default function PerfilLayout({ children }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile/notifications")
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, [status, pathname]);

  if (status !== "authenticated") {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm text-steel">Cargando…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <nav className="flex gap-1 border-b border-line pb-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/perfil" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-panel-2"
                }`}
              >
                <span className="relative flex">
                  <Icon size={15} />
                  {href === "/perfil/notificaciones" && unreadCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-ink">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6">{children}</div>
      </main>
    </>
  );
}
