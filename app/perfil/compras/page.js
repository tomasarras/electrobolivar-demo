"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import StarRating from "@/components/StarRating";
import { formatCurrency } from "@/lib/format";

export default function MisComprasPage() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    fetch("/api/profile/orders")
      .then((res) => res.json())
      .then(setOrders);
  }, []);

  if (!orders) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Mis compras</h1>
      <p className="mt-1 text-sm text-ink-soft">Productos que compraste en BolivarMarket.</p>

      {orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-md border border-dashed border-line p-12 text-center text-sm text-steel">
          <Package size={32} strokeWidth={1.3} />
          Todavía no compraste nada.
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-md border border-line bg-panel p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-wide text-steel">Pedido #{order.code}</p>
                <span className="font-mono text-[11px] text-steel">
                  {new Date(order.createdAt).toLocaleDateString("es-AR", { dateStyle: "long" })}
                </span>
              </div>
              <ul className="mt-3 divide-y divide-line">
                {order.items.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </ul>
              <div className="mt-2 flex justify-end border-t border-line pt-2 text-sm font-semibold">
                Total: {formatCurrency(order.total)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderItemRow({ item }) {
  const image = item.product?.images?.[0];

  return (
    <li className="flex items-start gap-3 py-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-panel-2">
        {image ? (
          <Image src={image.url} alt="" fill className="object-cover" />
        ) : (
          <ProductImagePlaceholder category={item.product?.category} className="h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {item.productId ? (
          <Link href={`/producto/${item.productId}`} className="truncate text-sm font-medium hover:underline">
            {item.productName}
          </Link>
        ) : (
          <p className="truncate text-sm font-medium">{item.productName}</p>
        )}
        <p className="font-mono text-xs text-ink-soft">
          {item.qty} x {formatCurrency(item.unitPrice, item.currency)}
        </p>
        <div className="mt-1.5">
          {item.review ? (
            <div className="flex items-center gap-2">
              <StarRating value={item.review.rating} readOnly size={13} />
              {item.review.comment && <span className="text-xs text-ink-soft">"{item.review.comment}"</span>}
            </div>
          ) : item.productId ? (
            <ReviewForm item={item} />
          ) : null}
        </div>
      </div>
    </li>
  );
}

function ReviewForm({ item }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!rating) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId: item.id, rating, comment }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // best effort
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <p className="text-xs text-accent-2">¡Gracias por tu reseña!</p>;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-steel underline-offset-2 hover:text-accent hover:underline">
        Dejar reseña
      </button>
    );
  }

  return (
    <div className="mt-1 max-w-xs rounded-md border border-line bg-panel-2 p-2.5">
      <StarRating value={rating} onChange={setRating} size={16} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Contanos tu experiencia (opcional)"
        className="mt-1.5 w-full resize-y rounded-md border border-line bg-paper px-2 py-1.5 text-xs"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!rating || submitting}
        className="mt-1.5 rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:brightness-110 disabled:opacity-50"
      >
        Enviar
      </button>
    </div>
  );
}
