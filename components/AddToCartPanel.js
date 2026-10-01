"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PlayCircle, CreditCard } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function AddToCartPanel({ product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const { status } = useSession();
  const [added, setAdded] = useState(false);
  const outOfStock = product.inStock === false;

  function handleAdd() {
    if (outOfStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/producto/${product.id}`)}`);
      return;
    }
    handleAdd();
    router.push("/carrito");
  }

  return (
    <div className="mt-6 space-y-4">
      {product.videoUrl && (
        <a
          href={product.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:brightness-110"
        >
          <PlayCircle size={17} />
          Ver video
        </a>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="rounded-md border border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock ? "Sin stock" : added ? "¡Agregado!" : "Agregar al carrito"}
        </button>
        {!outOfStock && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-ink hover:brightness-105"
          >
            Comprar ahora
          </button>
        )}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-steel">
        <CreditCard size={14} />
        Mercado Pago, MODO, tarjeta, transferencia o efectivo
      </p>
    </div>
  );
}
