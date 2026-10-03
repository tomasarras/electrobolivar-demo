"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, CreditCard, Landmark, Banknote, MessageCircle, Loader2, CheckCircle2, Copy, Check, Store, Truck } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import StarRating from "@/components/StarRating";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/CartProvider";

// Mercado Pago is wired up for real (Checkout Pro, sandbox/test credentials —
// see MP_ACCESS_TOKEN in .env.example). MODO and "Otra tarjeta" don't have a
// real gateway behind them, so they stay simulated: a fake "processing" state
// that lands on the same confirmation screen.
const PAY_NOW_METHODS = {
  mercadopago: { label: "Mercado Pago", description: "Tarjeta, transferencia o efectivo", icon: CreditCard, color: "#00b1ea" },
  modo: { label: "MODO", description: "Pagás directo desde tu cuenta bancaria", icon: Landmark, color: "#5b3df5" },
  tarjeta: { label: "Otra tarjeta", description: "Ualá Bis, Getnet, Naranja X, Decidir", icon: CreditCard, color: "#1c1b18" },
};

const CVU = "0000003100094567892312";
const ALIAS = "mercadobolivar.mp";
const MP_ORDER_KEY = (code) => `eb_mp_order_${code}`;

export default function CarritoPage() {
  return (
    <Suspense fallback={null}>
      <CarritoContent />
    </Suspense>
  );
}

function CarritoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, loaded, updateQty, removeItem, clearCart, total } = useCart();
  const [whatsapp, setWhatsapp] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("retiro");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [method, setMethod] = useState("mercadopago");
  const [status, setStatus] = useState("idle"); // idle | processing | confirmed
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [copied, setCopied] = useState("");
  const [cashCode] = useState(() => `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setWhatsapp(data.whatsapp || ""))
      .catch(() => setWhatsapp(""));
  }, []);

  // Best-effort order record — used to attribute sales/commission to sellers.
  // Never blocks checkout: a failed write here shouldn't break the demo.
  async function persistOrder({ code, items: cartItems, deliveryMethod: dMethod, address: addr, contactPhone: phone, paymentMethod, deliveryNote: note }) {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, items: cartItems, deliveryMethod: dMethod, address: addr, contactPhone: phone, paymentMethod, deliveryNote: note }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      // ignore — order tracking is secondary to the (simulated) purchase itself
      return null;
    }
  }

  // Handles the redirect back from Mercado Pago's checkout (success/failure/pending).
  /* eslint-disable react-hooks/set-state-in-effect -- syncs confirmation state from the MP redirect's query params, runs once per return */
  useEffect(() => {
    const mpStatus = searchParams.get("mp_status");
    const mpOrder = searchParams.get("mp_order");
    if (!mpStatus || !mpOrder) return;

    const raw = window.localStorage.getItem(MP_ORDER_KEY(mpOrder));
    const snapshot = raw ? JSON.parse(raw) : null;

    if (mpStatus === "failure") {
      setPaymentError("El pago con Mercado Pago no se completó. Podés intentar de nuevo o elegir otro método.");
    } else {
      if (snapshot) {
        setDeliveryMethod(snapshot.deliveryMethod);
        setAddress(snapshot.address || "");
        setContactPhone(snapshot.contactPhone || "");
        setDeliveryNote(snapshot.deliveryNote || "");
        if (snapshot.items?.length) {
          persistOrder({
            code: mpOrder,
            items: snapshot.items,
            deliveryMethod: snapshot.deliveryMethod,
            address: snapshot.address,
            contactPhone: snapshot.contactPhone,
            paymentMethod: "mercadopago",
            deliveryNote: snapshot.deliveryNote,
          }).then((order) => setOrderItems(order?.items || []));
        }
      }
      setPaymentNote(
        mpStatus === "pending"
          ? "Mercado Pago marcó este pago como pendiente — es el entorno de pruebas (sandbox), no se realizó ningún cobro real."
          : "Pago aprobado por Mercado Pago en modo sandbox/test — no se realizó ningún cobro real."
      );
      setOrderCode(mpOrder);
      setStatus("confirmed");
      clearCart();
    }
    window.localStorage.removeItem(MP_ORDER_KEY(mpOrder));
    router.replace("/carrito");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function confirmOrder(methodLabel) {
    const code = `EB-${Date.now().toString().slice(-6)}`;
    const order = await persistOrder({ code, items, deliveryMethod, address, contactPhone, paymentMethod: method, deliveryNote });
    setOrderItems(order?.items || []);
    setPaymentNote(`Simulación de pago con ${methodLabel} — es una demo de portfolio, no se realizó ningún cobro real.`);
    setOrderCode(code);
    setStatus("confirmed");
    clearCart();
  }

  function handlePayNow(methodLabel) {
    setStatus("processing");
    setTimeout(() => confirmOrder(methodLabel), 1400);
  }

  async function handleMercadoPagoCheckout() {
    setPaymentError("");
    setStatus("processing");
    const code = `EB-${Date.now().toString().slice(-6)}`;
    window.localStorage.setItem(MP_ORDER_KEY(code), JSON.stringify({ items, deliveryMethod, address, contactPhone, deliveryNote }));
    try {
      const res = await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, orderCode: code, deliveryMethod, address, contactPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago con Mercado Pago");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      window.localStorage.removeItem(MP_ORDER_KEY(code));
      setPaymentError(err.message);
      setStatus("idle");
    }
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
          {contactPhone && <p className="mt-1 text-sm text-ink-soft">Contacto: {contactPhone}</p>}
          <p className="mt-2 text-sm text-steel">{paymentNote}</p>

          {orderItems.length > 0 && (
            <div className="mt-8 space-y-3 text-left">
              <p className="text-center font-mono text-[11px] uppercase tracking-wide text-steel">¿Qué te pareció tu compra?</p>
              {orderItems.map((item) => (
                <ReviewForm key={item.id} item={item} />
              ))}
            </div>
          )}

          <Link href="/tienda" className="mt-6 inline-block rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper hover:brightness-110">
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
          <Link href="/tienda" className="mt-6 inline-block rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper hover:brightness-110">
            Ir al catálogo
          </Link>
        </main>
      </>
    );
  }

  const deliveryLine = deliveryMethod === "envio" ? `Envío a domicilio${address ? ` - ${address}` : ""}` : "Retiro en el local";
  const message =
    "Hola! Quiero consultar por este pedido de MercadoBolívar:\n" +
    items.map((i) => `${i.qty}x ${i.name} - ${formatCurrency(i.price * i.qty)}`).join("\n") +
    `\n\nTotal estimado: ${formatCurrency(total)}` +
    `\nEntrega: ${deliveryLine}` +
    (contactPhone ? `\nContacto: ${contactPhone}` : "") +
    (deliveryNote ? `\nNota: ${deliveryNote}` : "");
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
                  <button
                    type="button"
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    className="px-2.5 py-0.5 hover:bg-panel-2"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.productId, item.qty + 1)}
                    className="px-2.5 py-0.5 hover:bg-panel-2"
                  >
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

          <div className="mt-3">
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-steel">Número de contacto</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="11 2345 6789"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-steel">
              Nota para el envío (opcional)
            </label>
            <textarea
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              rows={2}
              placeholder="Ej: después de las 14hs voy a estar en mi casa"
              className="w-full resize-y rounded-md border border-line bg-paper px-3 py-2 text-sm"
            />
          </div>
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
                onClick={() => (method === "mercadopago" ? handleMercadoPagoCheckout() : handlePayNow(payNow.label))}
                disabled={status === "processing"}
                style={{ backgroundColor: payNow.color }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-70"
              >
                {status === "processing" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> {method === "mercadopago" ? "Redirigiendo…" : "Procesando…"}
                  </>
                ) : (
                  <>
                    <payNow.icon size={16} /> Pagar con {payNow.label}
                  </>
                )}
              </button>
              {paymentError && <p className="mt-2 text-center text-sm text-danger">{paymentError}</p>}
              <p className="mt-2 text-center text-xs text-steel">
                {method === "mercadopago"
                  ? "Te redirige a Mercado Pago en modo sandbox/test: usá una tarjeta de prueba, no se procesa ningún cobro real."
                  : "Demo de portfolio: la pasarela es una simulación, no se procesa ningún pago real."}
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
                className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-70"
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
                className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-70"
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
                className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-70"
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

function ReviewForm({ item }) {
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
      // best effort — a failed review shouldn't block the confirmation screen
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-line bg-panel p-4 text-center text-sm text-ink-soft">
        ¡Gracias por tu reseña de {item.productName}!
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <p className="text-sm font-medium">{item.productName}</p>
      <div className="mt-2">
        <StarRating value={rating} onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Contanos tu experiencia (opcional)"
        className="mt-2 w-full resize-y rounded-md border border-line bg-paper px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!rating || submitting}
        className="mt-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-50"
      >
        {submitting ? "Enviando…" : "Enviar reseña"}
      </button>
    </div>
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
