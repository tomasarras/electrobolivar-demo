"use client";

import Link from "next/link";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/components/CartProvider";

export default function StoreHeader() {
  const { itemCount } = useCart() || { itemCount: 0 };
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/tienda" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold tracking-tight">
            ELECTRO<span className="text-accent">BOLÍVAR</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/tienda" className="hidden hover:text-accent sm:inline">
            Catálogo
          </Link>

          {status === "authenticated" ? (
            <div className="flex items-center gap-3">
              <Link href="/perfil" className="flex items-center gap-1.5 text-ink-soft hover:text-accent">
                <User size={16} />
                <span className="hidden sm:inline">{session.user?.name || session.user?.email}</span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/tienda" })}
                className="flex items-center gap-1 text-ink-soft hover:text-accent"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 hover:text-accent">
              <User size={18} />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Link>
          )}

          <Link href="/carrito" className="relative flex items-center gap-1 hover:text-accent">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-ink">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
