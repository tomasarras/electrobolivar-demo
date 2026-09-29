"use client";

import Link from "next/link";
import { Package, Settings } from "lucide-react";

const CARDS = [
  { href: "/admin/productos", label: "Productos", description: "Cargar electrodomésticos, precios, fotos y video", icon: Package },
  { href: "/admin/configuracion", label: "Configuración", description: "Número de WhatsApp para recibir pedidos", icon: Settings },
];

export default function AdminPanelPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Panel</h1>
      <p className="mt-1 text-sm text-ink-soft">Elegí qué querés administrar.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-md border border-line bg-panel p-5 transition hover:-translate-y-0.5 hover:border-steel"
          >
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
