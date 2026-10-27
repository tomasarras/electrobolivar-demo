"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Undo2, Loader2, Truck, CheckCircle2, XCircle } from "lucide-react";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import StarRating from "@/components/StarRating";
import { formatCurrency } from "@/lib/format";
import { deliveryDeadline } from "@/lib/delivery";

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
                  <OrderItemRow key={item.id} item={item} orderCode={order.code} deliveryMethod={order.deliveryMethod} />
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

function OrderItemRow({ item, orderCode, deliveryMethod }) {
  const image = item.product?.images?.[0];
  const [status, setStatus] = useState(item.status);
  const [confirming, setConfirming] = useState(false);

  async function respond(received) {
    setConfirming(true);
    try {
      const res = await fetch(`/api/profile/order-items/${item.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ received }),
      });
      if (res.ok) setStatus(received ? "entregado" : "cancelado");
    } finally {
      setConfirming(false);
    }
  }

  // Solo puede confirmar o rechazar una vez que el vendedor marcó el
  // pedido como "Ya entregado" — no antes.
  const canConfirmReceived = status === "enviado" && Boolean(item.sellerDeliveredAt);

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
          <Link href={`/producto/${item.productId}`} className="block truncate text-sm font-medium hover:underline">
            {item.productName}
          </Link>
        ) : (
          <p className="truncate text-sm font-medium">{item.productName}</p>
        )}
        <p className="font-mono text-xs text-ink-soft">
          {item.qty} x {formatCurrency(item.unitPrice, item.currency)}
        </p>

        {deliveryMethod === "envio" && (
          <ShipmentStatus status={status} sellerDeliveredAt={item.sellerDeliveredAt} />
        )}

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
      {item.productId && (
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <ReturnRequestForm item={item} orderCode={orderCode} />
          {canConfirmReceived && (
            <button
              type="button"
              onClick={() => respond(true)}
              disabled={confirming}
              className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-steel hover:text-ink disabled:opacity-50"
            >
              {confirming ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              Ya recibí mi compra
            </button>
          )}
          {canConfirmReceived && (
            <button
              type="button"
              onClick={() => respond(false)}
              disabled={confirming}
              className="flex items-center gap-1 rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-white hover:brightness-95 disabled:opacity-50"
            >
              {confirming ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              No recibí el producto
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function ShipmentStatus({ status, sellerDeliveredAt }) {
  if (status === "pendiente") {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-steel">
        <Package size={12} />
        El vendedor todavía no despachó el envío.
      </p>
    );
  }

  if (status === "enviado" && !sellerDeliveredAt) {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-ink">
        <Truck size={13} />
        Tu pedido está en camino
      </p>
    );
  }

  if (status === "enviado" && sellerDeliveredAt) {
    const deadline = deliveryDeadline(sellerDeliveredAt);
    return (
      <div className="mt-1.5 rounded-md border border-line bg-panel-2 p-2.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <CheckCircle2 size={13} />
          El vendedor marcó tu pedido como entregado
        </p>
        <p className="mt-0.5 text-[11px] text-ink-soft">
          ¿Recibiste el producto? Confirmá con los botones de la derecha. Si no respondés antes del{" "}
          {deadline?.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}, se confirma la entrega
          automáticamente.
        </p>
      </div>
    );
  }

  if (status === "entregado") {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-accent-2">
        <CheckCircle2 size={12} />
        Entregado
      </p>
    );
  }

  if (status === "cancelado") {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-danger">
        <XCircle size={12} />
        Compra cancelada — tu dinero fue reembolsado
      </p>
    );
  }

  return null;
}

function ReturnRequestForm({ item, orderCode }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!reason.trim()) {
      setError("Contanos el motivo.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          orderId: item.orderId,
          about: "devolucion",
          body: `Pedido #${orderCode} — Quiero devolver "${item.productName}". Motivo: ${reason.trim()}`,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("No se pudo enviar el pedido de devolución.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-soft">
        Devolución solicitada
      </span>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-steel hover:text-ink"
      >
        <Undo2 size={12} />
        Devolución del producto
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-md border border-line bg-panel p-3 shadow-lg">
          <p className="text-xs font-semibold">Solicitar devolución</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Contanos el motivo"
            className="mt-1.5 w-full resize-y rounded-md border border-line bg-paper px-2 py-1.5 text-xs"
          />
          {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
          <div className="mt-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:brightness-110 disabled:opacity-50"
            >
              {submitting && <Loader2 size={12} className="animate-spin" />}
              Enviar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-steel"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
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
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-accent underline-offset-2 hover:underline">
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
