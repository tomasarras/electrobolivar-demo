"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, CreditCard, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/CartProvider";

export default function CarritoPage() {
  const { items, loaded, updateQty, removeItem, clearCart, total } = useCart();
  const [whatsapp, setWhatsapp] = useState("");
  const [method, setMethod] = useState("mercadopago");
  const [mpStatus, setMpStatus] = useState("idle"); // idle | processing | confirmed
  const [orderCode, setOrderCode] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setWhatsapp(data.whatsapp || ""))
      .catch(() => setWhatsapp(""));
  }, []);

  function handlePayMercadoPago() {
    setMpStatus("processing");
    setTimeout(() => {
      setOrderCode(`EB-${Date.now().toString().slice(-6)}`);
      setMpStatus("confirmed");
      clearCart();
    }, 1400);
  }

  if (!loaded) return null;

  if (mpStatus === "confirmed") {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
          <CheckCircle2 size={48} className="mx-auto text-accent-2" />
          <h1 className="mt-4 font-display text-2xl font-bold">¡Pedido confirmado!</h1>
          <p className="mt-2 font-mono text-sm text-ink-soft">Pedido #{orderCode}</p>
          <p className="mt-4 text-sm text-steel">
            Simulación de pago con Mercado Pago — es una demo de portfolio, no se realizó ningún cobro real.
          </p>
          <Link href="/tienda" className="mt-6 inline-block rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper">
            Volver al catálogo
          </Link>
        </main>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
          <h1 className="font-display text-2xl font-bold">Tu pedido está vacío</h1>
          <Link href="/tienda" className="mt-6 inline-block rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper">
            Ir al catálogo
          </Link>
        </main>
      </>
    );
  }

  const message =
    "Hola! Quiero consultar por este pedido de ElectroBolívar:\n" +
    items.map((i) => `${i.qty}x ${i.name} - ${formatCurrency(i.price * i.qty)}`).join("\n") +
    `\n\nTotal estimado: ${formatCurrency(total)}`;
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` : null;

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold">Tu pedido</h1>

        <ul className="mt-6 divide-y divide-line rounded-md border border-line bg-panel">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-panel-2">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill className="object-cover" />
                ) : (
                  <ProductImagePlaceholder className="h-full w-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="font-mono text-sm text-ink-soft">{formatCurrency(item.price)}</p>
                <div className="mt-1 flex w-fit items-center rounded-full border border-line font-mono text-sm">
                  <button type="button" onClick={() => updateQty(item.productId, item.qty - 1)} className="px-2.5 py-0.5">
                    −
                  </button>
                  <span className="w-6 text-center">{item.qty}</span>
                  <button type="button" onClick={() => updateQty(item.productId, item.qty + 1)} className="px-2.5 py-0.5">
                    +
                  </button>
                </div>
              </div>
              <span className="font-mono font-semibold">{formatCurrency(item.price * item.qty)}</span>
              <button type="button" onClick={() => removeItem(item.productId)} className="text-steel hover:text-danger">
                <X size={18} />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-md border border-line bg-panel p-5">
          <div className="flex justify-between text-base font-semibold">
            <span>Total estimado</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>

          <p className="mb-2 mt-6 font-mono text-[11px] uppercase tracking-wide text-steel">Método de pago</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMethod("mercadopago")}
              className={`flex items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                method === "mercadopago" ? "border-ink bg-panel-2" : "border-line hover:border-steel"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00b1ea] text-white">
                <CreditCard size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold">Mercado Pago</span>
                <span className="block text-xs text-ink-soft">Tarjeta, transferencia o efectivo</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("whatsapp")}
              className={`flex items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                method === "whatsapp" ? "border-ink bg-panel-2" : "border-line hover:border-steel"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-2 text-paper">
                <MessageCircle size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold">WhatsApp</span>
                <span className="block text-xs text-ink-soft">Coordinás el pago con el vendedor</span>
              </span>
            </button>
          </div>

          {method === "mercadopago" ? (
            <>
              <button
                type="button"
                onClick={handlePayMercadoPago}
                disabled={mpStatus === "processing"}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#00b1ea] py-3 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-70"
              >
                {mpStatus === "processing" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Procesando…
                  </>
                ) : (
                  <>
                    <CreditCard size={16} /> Pagar con Mercado Pago
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-xs text-steel">
                Demo de portfolio: la pasarela es una simulación, no se procesa ningún pago real.
              </p>
            </>
          ) : whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-accent-2 py-3 text-sm font-semibold text-paper hover:brightness-105"
            >
              Enviar pedido por WhatsApp
            </a>
          ) : (
            <p className="mt-5 text-sm text-steel">El vendedor todavía no configuró un WhatsApp de contacto.</p>
          )}
        </div>
      </main>
    </>
  );
}
