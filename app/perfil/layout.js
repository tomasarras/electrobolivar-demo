"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MapPin, Package } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";

const NAV = [
  { href: "/perfil", label: "Mis datos", icon: MapPin },
  { href: "/perfil/compras", label: "Mis compras", icon: Package },
];

export default function PerfilLayout({ children }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status !== "authenticated") {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-sm px-4 py-20 text-center sm:px-6">
          <p className="text-sm text-steel">Cargando…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-sm px-4 py-10 sm:px-6">
        <nav className="flex gap-1 border-b border-line pb-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-panel-2"
                }`}
              >
                <Icon size={15} />
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
