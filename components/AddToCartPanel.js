"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PlayCircle, CreditCard, Truck, Store, Clock, Zap } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/format";

export default function AddToCartPanel({ product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const { status } = useSession();
  const [added, setAdded] = useState(false);
  const outOfStock = (product.stock ?? 0) <= 0;

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
      <p className="flex items-center gap-1.5 text-xs text-steel">
        {product.shipping === false ? (
          <>
            <Store size={14} />
            Solo retiro en el local
          </>
        ) : product.freeShippingMinAmount === 0 ? (
          <>
            <Truck size={14} />
            <span className="font-semibold text-accent-2">Envío gratis</span>
          </>
        ) : product.freeShippingMinAmount > 0 ? (
          <>
            <Truck size={14} />
            Hace envíos ·{" "}
            <span className="font-semibold text-accent-2">
              gratis en compras desde {formatCurrency(product.freeShippingMinAmount)}
            </span>
          </>
        ) : (
          <>
            <Truck size={14} />
            Hace envíos
          </>
        )}
      </p>
      {product.shipping !== false && (product.freeShippingMinAmount === 0 || product.freeShippingMinAmount > 0) && (
        <p className="text-xs text-steel">
          El envío gratis aplica dentro de un radio de 4 km. A otras ciudades puede tener costo adicional.
        </p>
      )}
      {product.shipping !== false && product.fastShipping && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
          <Zap size={14} fill="currentColor" />
          Envío rápido BM
        </p>
      )}
      {(product.scheduleDays || product.scheduleHours) && (
        <p className="flex items-center gap-1.5 text-xs text-steel">
          <Clock size={14} />
          {[
            product.scheduleDays,
            [product.scheduleHours, product.scheduleHours2].filter(Boolean).join(" y "),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
