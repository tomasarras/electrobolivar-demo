"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";

export default function SellerPayoutNotice() {
  const [seller, setSeller] = useState(undefined);

  useEffect(() => {
    fetch("/api/seller")
      .then((res) => res.json())
      .then(setSeller)
      .catch(() => {});
  }, []);

  if (!seller || seller.sawPayoutNotice) return null;

  function handleDismiss() {
    setSeller((prev) => ({ ...prev, sawPayoutNotice: true }));
    fetch("/api/seller/payout-notice", { method: "POST" }).catch(() => {});
  }

  return (
    <div className="border-b border-line bg-accent/10">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 sm:px-6">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-accent" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-ink">¡Antes de vender!</p>
          <p className="mt-0.5 text-ink-soft">
            Para recibir tus pagos, recordá completar tus datos de cobro antes de publicar tu primer producto.
          </p>
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-2 rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:brightness-110"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
