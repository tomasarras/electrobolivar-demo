"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Package, Settings, LogOut } from "lucide-react";
import { useAdmin } from "@/components/AdminProvider";

const NAV = [
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminLayout({ children }) {
  const { isAdmin, loaded, exitAdmin } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !isAdmin) router.replace("/");
  }, [loaded, isAdmin, router]);

  if (!loaded || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-steel">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-1.5 font-display text-lg font-bold">
            <LayoutGrid size={18} />
            ElectroBolívar <span className="font-sans text-sm font-normal text-steel">admin</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                  pathname.startsWith(href) ? "bg-ink text-paper" : "hover:bg-panel-2"
                }`}
              >
                <Icon size={16} />
                {label}
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
