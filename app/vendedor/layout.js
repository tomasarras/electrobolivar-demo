"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Store, Package, MessageSquare, Wallet, MessagesSquare } from "lucide-react";
import SellerNotificationBell from "@/components/SellerNotificationBell";
import SellerPayoutNotice from "@/components/SellerPayoutNotice";

const NAV_BEFORE_BELL = [
  { href: "/vendedor", label: "Resumen", icon: Store },
  { href: "/vendedor/productos", label: "Mis productos", icon: Package },
];

const NAV_AFTER_BELL = [
  { href: "/vendedor/cobros", label: "Datos de cobro", icon: Wallet },
  { href: "/vendedor/consultas", label: "Consultas", icon: MessagesSquare },
  { href: "/vendedor/mensajes", label: "Mensaje al admin", icon: MessageSquare },
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
            BolivarMarket <span className="font-sans text-sm font-normal text-steel">vendedor</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            {NAV_BEFORE_BELL.map(({ href, label, icon: Icon }) => {
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
            <SellerNotificationBell />
            {NAV_AFTER_BELL.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
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
      <SellerPayoutNotice />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
