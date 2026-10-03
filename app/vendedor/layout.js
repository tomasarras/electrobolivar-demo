"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Store, Package, Receipt } from "lucide-react";

const NAV = [
  { href: "/vendedor", label: "Resumen", icon: Store },
  { href: "/vendedor/productos", label: "Mis productos", icon: Package },
  { href: "/vendedor/ventas", label: "Ventas", icon: Receipt },
];

export default function VendedorLayout({ children }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status !== "authenticated") {
    return <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-steel">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/vendedor" className="flex items-center gap-1.5 font-display text-lg font-bold">
            <Store size={18} />
            MercadoBolívar <span className="font-sans text-sm font-normal text-steel">vendedor</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/vendedor" ? pathname === href : pathname.startsWith(href);
              return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                  active ? "bg-ink text-paper" : "hover:bg-panel-2"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
              );
            })}
            <Link href="/tienda" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ink-soft hover:bg-panel-2">
              Volver a la tienda
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
