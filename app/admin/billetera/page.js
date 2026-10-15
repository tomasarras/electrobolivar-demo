"use client";

import { useEffect, useState } from "react";
import { Wallet, Percent, Package } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function AdminBilleteraPage() {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    fetch("/api/admin/wallet")
      .then((res) => res.json())
      .then(setWallet);
  }, []);

  if (!wallet) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Billetera</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Ingresos que recibe la página por comisión de los productos vendidos por los vendedores.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CurrencyCard label="Pesos argentinos" symbol="$" currency="ARS" data={wallet.ARS} />
        <CurrencyCard label="Dólares" symbol="US$" currency="USD" data={wallet.USD} />
      </div>
    </div>
  );
}

function CurrencyCard({ label, currency, data }) {
  return (
    <div className="rounded-md border border-line bg-panel p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Wallet size={16} className="text-steel" />
        {label}
      </div>
      <p className="mt-3 font-mono text-2xl font-bold">{formatCurrency(data.commission, currency)}</p>
      <p className="font-mono text-[10px] uppercase tracking-wide text-steel">Comisión recibida</p>

      <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <Percent size={13} />
          Ventas brutas: {formatCurrency(data.gross, currency)}
        </span>
        <span className="flex items-center gap-1.5">
          <Package size={13} />
          {data.items} {data.items === 1 ? "producto vendido" : "productos vendidos"}
        </span>
      </div>
    </div>
  );
}
