"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, CreditCard, Landmark, Banknote, MessageCircle, Loader2, CheckCircle2, Copy, Check, Store, Truck } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/CartProvider";

// Simulated only — no real processor is wired up. Each method just walks
// through a fake "processing" state and lands on the same confirmation
// screen, so the demo can showcase the payment options a real Argentine
// store would offer without handling actual money.
const PAY_NOW_METHODS = {
  mercadopago: { label: "Mercado Pago", description: "Tarjeta, transferencia o efectivo", icon: CreditCard, color: "#00b1ea" },
  modo: { label: "MODO", description: "Pagás directo desde tu cuenta bancaria", icon: Landmark, color: "#5b3df5" },
  tarjeta: { label: "Otra tarjeta", description: "Ualá Bis, Getnet, Naranja X, Decidir", icon: CreditCard, color: "#1c1b18" },
};

const CVU = "0000003100094567892312";
const ALIAS = "electrobolivar.mp";

export default function CarritoPage() {
  const { items, loaded, updateQty, removeItem, clearCart, total } = useCart();
  const [whatsapp, setWhatsapp] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("retiro");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("mercadopago");
  const [status, setStatus] = useState("idle"); // idle | processing | confirmed
  const [confirmedMethod, setConfirmedMethod] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [copied, setCopied] = useState("");
  const [cashCode] = useState(() => `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setWhatsapp(data.whatsapp || ""))
      .catch(() => setWhatsapp(""));
  }, []);

  function confirmOrder(methodLabel) {
    setConfirmedMethod(methodLabel);
    setOrderCode(`EB-${Date.now().toString().slice(-6)}`);
    setStatus("confirmed");
    clearCart();
  }

  function handlePayNow(methodLabel) {
    setStatus("processing");
    setTimeout(() => confirmOrder(methodLabel), 1400);
  }

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    });
  }

  if (!loaded) return null;

  if (status === "confirmed") {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
          <CheckCircle2 size={48} className="mx-auto text-accent-2" />
          <h1 className="mt-4 font-display text-2xl font-bold">¡Pedido confirmado!</h1>
          <p className="mt-2 font-mono text-sm text-ink-soft">Pedido #{orderCode}</p>
          <p className="mt-4 text-sm text-ink-soft">
            {deliveryMethod === "envio" ? `Envío a domicilio${address ? ` — ${address}` : ""}` : "Retiro en el local"}
          </p>
          <p className="mt-2 text-sm text-steel">
            Simulación de pago con {confirmedMethod} — es una demo de portfolio, no se realizó ningún cobro real.
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

  const deliveryLine = deliveryMethod === "envio" ? `Envío a domicilio${address ? ` - ${address}` : ""}` : "Retiro en el local";
  const message =
    "Hola! Quiero consultar por este pedido de ElectroBolívar:\n" +
    items.map((i) => `${i.qty}x ${i.name} - ${formatCurrency(i.price * i.qty)}`).join("\n") +
    `\n\nTotal estimado: ${formatCurrency(total)}` +
    `\nEntrega: ${deliveryLine}`;
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` : null;
  const payNow = PAY_NOW_METHODS[method];

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
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-steel">Forma de entrega</p>
          <div className="grid grid-cols-2 gap-3">
            <MethodCard
              active={deliveryMethod === "retiro"}
              onClick={() => setDeliveryMethod("retiro")}
              icon={Store}
              color="#1c1b18"
              label="Retiro en el local"
              description="Lo retirás vos en el local"
            />
            <MethodCard
              active={deliveryMethod === "envio"}
              onClick={() => setDeliveryMethod("envio")}
              icon={Truck}
              color="#b85315"
              label="Envío a domicilio"
              description="Te lo llevamos nosotros"
            />
          </div>

          {deliveryMethod === "envio" && (
            <div className="mt-3">
              <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-steel">Dirección de entrega</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, localidad"
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        <div className="mt-6 rounded-md border border-line bg-panel p-5">
          <div className="flex justify-between text-base font-semibold">
            <span>Total estimado</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>

          <p className="mb-2 mt-6 font-mono text-[11px] uppercase tracking-wide text-steel">Método de pago</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(PAY_NOW_METHODS).map(([key, m]) => (
              <MethodCard key={key} active={method === key} onClick={() => setMethod(key)} icon={m.icon} color={m.color} label={m.label} description={m.description} />
            ))}
            <MethodCard
              active={method === "transferencia"}
              onClick={() => setMethod("transferencia")}
              icon={Landmark}
              color="#2f5d50"
              label="Transferencia"
              description="CVU / alias, sin comisión"
            />
            <MethodCard
              active={method === "efectivo"}
              onClick={() => setMethod("efectivo")}
              icon={Banknote}
              color="#8a5a2e"
              label="Rapipago / Pago Fácil"
              description="Pagás en efectivo con un código"
            />
            <MethodCard
              active={method === "efectivo_local"}
              onClick={() => setMethod("efectivo_local")}
              icon={Banknote}
              color="#3f6b35"
              label="Efectivo en Bolívar"
              description="Retiro o entrega, solo ciudad de Bolívar"
            />
            <MethodCard
              active={method === "whatsapp"}
              onClick={() => setMethod("whatsapp")}
              icon={MessageCircle}
              color="#2c6b5e"
              label="WhatsApp"
              description="Coordinás el pago con el vendedor"
            />
          </div>

          {payNow ? (
            <>
              <button
                type="button"
                onClick={() => handlePayNow(payNow.label)}
                disabled={status === "processing"}
                style={{ backgroundColor: payNow.color }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-70"
              >
                {status === "processing" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Procesando…
                  </>
                ) : (
                  <>
                    <payNow.icon size={16} /> Pagar con {payNow.label}
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-xs text-steel">
                Demo de portfolio: la pasarela es una simulación, no se procesa ningún pago real.
              </p>
            </>
          ) : method === "transferencia" ? (
            <div className="mt-5 space-y-3 rounded-md border border-line bg-panel-2 p-4">
              <CopyRow label="CVU" value={CVU} copied={copied === "cvu"} onCopy={() => handleCopy(CVU, "cvu")} />
              <CopyRow label="Alias" value={ALIAS} copied={copied === "alias"} onCopy={() => handleCopy(ALIAS, "alias")} />
              <button
                type="button"
                onClick={() => handlePayNow("Transferencia bancaria")}
                disabled={status === "processing"}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-70"
              >
                {status === "processing" ? <Loader2 size={16} className="animate-spin" /> : null}
                Ya hice la transferencia
              </button>
              <p className="text-center text-xs text-steel">Demo de portfolio: no hay conciliación real, es solo una simulación.</p>
            </div>
          ) : method === "efectivo" ? (
            <div className="mt-5 space-y-3 rounded-md border border-line bg-panel-2 p-4 text-center">
              <p className="font-mono text-[11px] uppercase tracking-wide text-steel">Código de pago</p>
              <p className="font-mono text-2xl font-bold tracking-widest">{cashCode}</p>
              <p className="text-xs text-ink-soft">Pagalo en efectivo en cualquier Rapipago o Pago Fácil. Válido por 48hs.</p>
              <button
                type="button"
                onClick={() => handlePayNow("Rapipago / Pago Fácil")}
                disabled={status === "processing"}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-70"
              >
                {status === "processing" ? <Loader2 size={16} className="animate-spin" /> : null}
                Ya pagué el cupón
              </button>
              <p className="text-xs text-steel">Demo de portfolio: es solo una simulación.</p>
            </div>
          ) : method === "efectivo_local" ? (
            <div className="mt-5 space-y-3 rounded-md border border-line bg-panel-2 p-4 text-center">
              <p className="text-sm text-ink-soft">
                Disponible solo para clientes de la ciudad de Bolívar, Buenos Aires: coordinás el retiro en el local o la
                entrega, y pagás en efectivo en el momento.
              </p>
              <button
                type="button"
                onClick={() => handlePayNow("Efectivo en Bolívar")}
                disabled={status === "processing"}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-70"
              >
                {status === "processing" ? <Loader2 size={16} className="animate-spin" /> : null}
                Confirmar pedido en efectivo
              </button>
              <p className="text-xs text-steel">Demo de portfolio: es solo una simulación.</p>
            </div>
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

function MethodCard({ active, onClick, icon: Icon, color, label, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-md border p-3 text-left transition-colors ${
        active ? "border-ink bg-panel-2" : "border-line hover:border-steel"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: color }}>
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{label}</span>
        <span className="block truncate text-xs text-ink-soft">{description}</span>
      </span>
    </button>
  );
}

function CopyRow({ label, value, copied, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-line bg-paper px-3 py-2">
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-wide text-steel">{label}</span>
        <span className="block font-mono text-sm">{value}</span>
      </span>
      <button type="button" onClick={onCopy} className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs hover:border-steel">
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
