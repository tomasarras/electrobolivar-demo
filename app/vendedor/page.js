"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Package, Megaphone, MessageSquare, Bell } from "lucide-react";

export default function VendedorResumenPage() {
  const [seller, setSeller] = useState(undefined); // undefined = loading, null = not yet a seller
  const [productCount, setProductCount] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [commissionPct, setCommissionPct] = useState(5);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  function load() {
    fetch("/api/seller")
      .then((res) => res.json())
      .then(setSeller);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setCommissionPct(data.commissionPct ?? 5))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!seller) return;
    fetch("/api/seller/products")
      .then((res) => res.json())
      .then((products) => setProductCount(Array.isArray(products) ? products.length : 0));
    fetch("/api/seller/notifications")
      .then((res) => res.json())
      .then((data) => setUnreadNotifications(data.unreadCount || 0))
      .catch(() => {});
  }, [seller]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!storeName.trim()) {
      setError("Ingresá el nombre de tu tienda.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, whatsapp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear tu tienda");
      setSeller(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (seller === undefined) return <p className="text-sm text-steel">Cargando…</p>;

  if (seller === null) {
    return (
      <div className="max-w-md">
        <h1 className="font-display text-2xl font-bold">Vendé en BolivarMarket</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Creá tu tienda para empezar a publicar productos. La plataforma cobra una comisión sobre cada venta.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label className="block font-mono text-[11px] uppercase tracking-wide text-steel">Nombre de tu tienda</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Electrodomésticos del Sur"
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
          <label className="block font-mono text-[11px] uppercase tracking-wide text-steel">
            WhatsApp de contacto (opcional)
          </label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="5491122334455"
            inputMode="numeric"
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Crear mi tienda
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{seller.storeName}</h1>
      <p className="mt-1 text-sm text-ink-soft">Resumen de tu actividad como vendedor.</p>

      <div className="mt-6 rounded-md border border-line bg-panel p-4">
        <div className="flex items-start gap-3">
          <Megaphone size={18} className="mt-0.5 shrink-0 text-accent" />
          <div className="text-sm text-ink-soft">
            <p className="font-semibold text-ink">Información para vendedores</p>
            <p className="mt-2">
              Por cada venta concretada a través de BolivarMarket, cobramos una comisión del{" "}
              <strong className="text-ink">{commissionPct}%</strong> del valor de la venta.
            </p>
            <p className="mt-2">
              Las operaciones que se concreten por fuera de la página no generan comisión. Sin embargo, al vender a
              través de BolivarMarket, podrás construir tu reputación como vendedor, ganar la confianza de los
              compradores y mejorar tus oportunidades de venta.
            </p>
            <p className="mt-2">
              ¿Tenés alguna consulta?{" "}
              <Link href="/vendedor/mensajes" className="inline-flex items-center gap-1 font-semibold text-ink underline-offset-2 hover:underline">
                <MessageSquare size={13} />
                Mandanos un mensaje al administrador
              </Link>
              .
            </p>
            <p className="mt-2">¡Gracias por confiar en BolivarMarket!</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={Package} label="Productos" value={productCount} href="/vendedor/productos" />
        <Stat icon={Bell} label="Notificaciones" value={unreadNotifications} href="/vendedor/notificaciones" />
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/vendedor/productos/nuevo"
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:brightness-110"
        >
          Cargar producto
        </Link>
        <Link
          href="/vendedor/productos"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold hover:border-steel"
        >
          Ver mis productos
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, href }) {
  const content = (
    <>
      <Icon size={18} className="text-steel" />
      <p className="mt-2 font-mono text-lg font-semibold">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wide text-steel">{label}</p>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="block rounded-md border border-line bg-panel p-4 hover:border-steel">
        {content}
      </Link>
    );
  }
  return <div className="rounded-md border border-line bg-panel p-4">{content}</div>;
}
