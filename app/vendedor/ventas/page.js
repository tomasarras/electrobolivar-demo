"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";

export default function VendedorVentasPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/seller/orders")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-steel">Cargando…</p>;

  const { items, summary } = data;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Ventas</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Bruto {formatCurrency(summary.gross)} · Comisión {formatCurrency(summary.commission)} · Neto{" "}
        {formatCurrency(summary.net)}
      </p>

      {items.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-line p-8 text-center text-sm text-steel">
          Todavía no tenés ventas registradas.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-line bg-panel">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-steel">
                <th className="p-3 text-left">Pedido</th>
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-left">Cant.</th>
                <th className="p-3 text-left">Bruto</th>
                <th className="p-3 text-left">Comisión</th>
                <th className="p-3 text-left">Neto</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const gross = item.unitPrice * item.qty;
                return (
                  <tr key={item.id} className="border-b border-line/60 last:border-0">
                    <td className="p-3 font-mono text-xs text-steel">
                      #{item.order.code}
                      <br />
                      {new Date(item.order.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="p-3 font-medium">
                      {item.productName}
                      {item.order.deliveryNote && (
                        <p className="mt-0.5 text-xs font-normal italic text-steel">Nota: {item.order.deliveryNote}</p>
                      )}
                    </td>
                    <td className="p-3">{item.qty}</td>
                    <td className="p-3 font-mono">{formatCurrency(gross)}</td>
                    <td className="p-3 font-mono text-danger">-{formatCurrency(item.commissionAmt)}</td>
                    <td className="p-3 font-mono font-semibold">{formatCurrency(gross - item.commissionAmt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
