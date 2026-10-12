"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TrendingUp, Package, Receipt, Boxes, Smartphone, Monitor } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";

const STAT_TILES = [
  { key: "totalRevenue", label: "Ventas totales", icon: TrendingUp, format: formatCurrency },
  { key: "totalQty", label: "Unidades vendidas", icon: Boxes, format: (v) => v.toLocaleString("es-AR") },
  { key: "orderCount", label: "Pedidos", icon: Receipt, format: (v) => v.toLocaleString("es-AR") },
  { key: "distinctProducts", label: "Productos con ventas", icon: Package, format: (v) => v.toLocaleString("es-AR") },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-steel">Cargando…</p>;

  const { summary, ranking, devices } = data;
  const DEVICE_META = {
    mobile: { label: "Celular", icon: Smartphone },
    desktop: { label: "Computadora", icon: Monitor },
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Qué tan bien vende cada producto, en toda la tienda.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_TILES.map(({ key, label, icon: Icon, format }) => (
          <div key={key} className="rounded-md border border-line bg-panel p-4">
            <Icon size={18} className="text-steel" />
            <p className="mt-2 font-mono text-lg font-semibold">{format(summary[key])}</p>
            <p className="text-xs text-ink-soft">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">Visitas por dispositivo</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {devices.total > 0
          ? `Sobre ${devices.total.toLocaleString("es-AR")} ${devices.total === 1 ? "visita" : "visitas"} registradas.`
          : "Todavía no hay visitas registradas."}
      </p>

      {devices.total > 0 && (
        <ul className="mt-4 space-y-3">
          {devices.items.map(({ device, count, sharePct }) => {
            const { label, icon: Icon } = DEVICE_META[device];
            return (
              <li key={device} className="flex items-center gap-4 rounded-md border border-line bg-panel p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-panel-2 text-steel">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="shrink-0 font-mono text-sm font-semibold">{sharePct.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-panel-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(sharePct, 2)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-steel">
                    {count} {count === 1 ? "visita" : "visitas"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-8 font-display text-lg font-bold">Productos más vendidos</h2>
      <p className="mt-1 text-sm text-ink-soft">Porcentaje sobre el total de unidades vendidas.</p>

      {ranking.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-line p-8 text-center text-sm text-steel">
          Todavía no hay ventas registradas.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {ranking.map((p, i) => (
            <li
              key={p.productId || p.name}
              className="flex items-center gap-4 rounded-md border border-line bg-panel p-3"
            >
              <span className="w-5 shrink-0 text-center font-mono text-xs text-steel">{i + 1}</span>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-panel-2">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                ) : (
                  <ProductImagePlaceholder category={p.category} className="h-full w-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <span className="shrink-0 font-mono text-sm font-semibold">{p.sharePct.toFixed(1)}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-panel-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(p.sharePct, 2)}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-steel">
                  {p.category && <span>{categoryLabel(p.category)}</span>}
                  <span>·</span>
                  <span>
                    {p.qty} {p.qty === 1 ? "unidad" : "unidades"}
                  </span>
                  <span>·</span>
                  <span>{formatCurrency(p.revenue)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
