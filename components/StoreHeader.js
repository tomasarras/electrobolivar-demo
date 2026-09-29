"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function StoreHeader() {
  const { itemCount } = useCart() || { itemCount: 0 };

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
