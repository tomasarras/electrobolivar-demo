"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Settings, BarChart3, Store, MessageSquare, Wallet, Check } from "lucide-react";

const CARDS = [
  { href: "/admin/dashboard", label: "Dashboard", description: "Porcentaje de ventas por producto y totales de la tienda", icon: BarChart3 },
  { href: "/admin/productos", label: "Productos", description: "Cargar electrodomésticos, precios, fotos y video", icon: Package },
  { href: "/admin/vendedores", label: "Vendedores", description: "Ventas, comisión y neto de cada vendedor del marketplace", icon: Store },
  { href: "/admin/billetera", label: "Billetera", description: "Ingresos por comisión de los productos vendidos, en $ y US$", icon: Wallet },
  { href: "/admin/mensajes", label: "Mensajes", description: "Consultas y mensajes que lleguen a la tienda", icon: MessageSquare },
  { href: "/admin/configuracion", label: "Configuración", description: "Número de WhatsApp para recibir pedidos", icon: Settings },
];

export default function AdminPanelPage() {
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((res) => res.json())
      .then((data) => setUnreadMessages(data.unreadCount || 0))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Panel</h1>
      <p className="mt-1 text-sm text-ink-soft">Elegí qué querés administrar.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col gap-3 rounded-md border border-line bg-panel p-5 transition hover:-translate-y-0.5 hover:border-steel"
          >
            {href === "/admin/mensajes" && unreadMessages > 0 && (
              <span
                title="Tenés mensajes nuevos sin leer"
                className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-ink"
              >
                <Check size={13} strokeWidth={3} />
              </span>
            )}
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-panel-2">
              <Icon size={20} />
            </span>
            <span className="font-semibold">{label}</span>
            <span className="text-sm text-ink-soft">{description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
