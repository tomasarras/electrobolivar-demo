"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Package, Settings, LogOut, BarChart3, Store, MessageSquare, Wallet, Check } from "lucide-react";
import { useAdmin } from "@/components/AdminProvider";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/vendedores", label: "Vendedores", icon: Store },
  { href: "/admin/billetera", label: "Billetera", icon: Wallet },
  { href: "/admin/mensajes", label: "Mensajes", icon: MessageSquare },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

const UNREAD_POLL_MS = 20000;

export default function AdminLayout({ children }) {
  const { isAdmin, loaded, exitAdmin } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (loaded && !isAdmin) router.replace("/");
  }, [loaded, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    function load() {
      fetch("/api/admin/messages")
        .then((res) => res.json())
        .then((data) => setUnreadMessages(data.unreadCount || 0))
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, UNREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!loaded || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-steel">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-1.5 font-display text-lg font-bold">
            <LayoutGrid size={18} />
            BolivarMarket <span className="font-sans text-sm font-normal text-steel">admin</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                  pathname.startsWith(href) ? "bg-ink text-paper" : "hover:bg-panel-2"
                }`}
              >
                <Icon size={16} />
                {label}
                {href === "/admin/mensajes" && unreadMessages > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-ink">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                exitAdmin();
                router.push("/");
              }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ink-soft hover:bg-panel-2"
            >
              <LogOut size={16} />
              Salir
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
