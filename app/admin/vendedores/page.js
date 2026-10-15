"use client";

import { useEffect, useState } from "react";
import { Store, TrendingUp, Percent, Wallet, TriangleAlert } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function AdminVendedoresPage() {
  const [sellers, setSellers] = useState(null);

  useEffect(() => {
    fetch("/api/admin/sellers")
      .then((res) => res.json())
      .then(setSellers);
  }, []);

  async function toggleFlag(id, next) {
    setSellers((prev) => prev.map((s) => (s.id === id ? { ...s, flaggedFraud: next } : s)));
    await fetch(`/api/admin/sellers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flaggedFraud: next }),
    }).catch(() => {});
  }

  if (!sellers) return <p className="text-sm text-steel">Cargando…</p>;

  const totals = sellers.reduce(
    (acc, s) => {
      acc.gross += s.gross;
      acc.commission += s.commission;
      acc.net += s.net;
      return acc;
    },
    { gross: 0, commission: 0, net: 0 }
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Vendedores</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Ventas, comisión y neto de cada vendedor del marketplace — esta información no la ven los vendedores.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={Store} label="Vendedores" value={sellers.length} />
        <Stat icon={TrendingUp} label="Ventas brutas" value={formatCurrency(totals.gross)} />
        <Stat icon={Percent} label="Comisión total" value={formatCurrency(totals.commission)} />
        <Stat icon={Wallet} label="Neto vendedores" value={formatCurrency(totals.net)} />
      </div>

      {sellers.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-line p-8 text-center text-sm text-steel">
          Todavía no hay vendedores registrados.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-line bg-panel">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-steel">
                <th className="p-3 text-left">Vendedor</th>
                <th className="p-3 text-left">Productos</th>
                <th className="p-3 text-left">Quejas</th>
                <th className="p-3 text-left">Bruto</th>
                <th className="p-3 text-left">Comisión</th>
                <th className="p-3 text-left">Neto</th>
                <th className="p-3 text-left">Posible fraude</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id} className={`border-b border-line/60 last:border-0 ${s.flaggedFraud ? "bg-danger/5" : ""}`}>
                  <td className="p-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      {s.flaggedFraud && <TriangleAlert size={14} className="text-danger" />}
                      {s.storeName}
                    </span>
                    {s.whatsapp && <p className="text-xs text-steel">{s.whatsapp}</p>}
                  </td>
                  <td className="p-3">{s.productCount}</td>
                  <td className="p-3">
                    {s.complaintCount > 0 ? (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                        {s.complaintCount}
                      </span>
                    ) : (
                      <span className="text-xs text-steel">0</span>
                    )}
                  </td>
                  <td className="p-3 font-mono">{formatCurrency(s.gross)}</td>
                  <td className="p-3 font-mono text-danger">-{formatCurrency(s.commission)}</td>
                  <td className="p-3 font-mono font-semibold">{formatCurrency(s.net)}</td>
                  <td className="p-3">
                    <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                      <input
                        type="checkbox"
                        checked={s.flaggedFraud}
                        onChange={(e) => toggleFlag(s.id, e.target.checked)}
                      />
                      Marcar
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <Icon size={18} className="text-steel" />
      <p className="mt-2 font-mono text-lg font-semibold">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wide text-steel">{label}</p>
    </div>
  );
}
