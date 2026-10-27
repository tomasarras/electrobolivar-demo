"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function SellerPayoutNotice() {
  const [seller, setSeller] = useState(undefined);

  useEffect(() => {
    fetch("/api/seller")
      .then((res) => res.json())
      .then(setSeller)
      .catch(() => {});
  }, []);

  if (!seller) return null;
  // Sigue apareciendo hasta que el vendedor realmente cargue cómo cobrar
  // (CBU/CVU o alias) — no es un simple "Entendido" que se descarta solo.
  const hasPayoutInfo = Boolean(seller.payoutCbu?.trim() || seller.payoutAlias?.trim());
  if (hasPayoutInfo) return null;

  return (
    <div className="border-b border-line bg-accent/10">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 sm:px-6">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-accent" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-ink">¡Antes de vender!</p>
          <p className="mt-0.5 text-ink-soft">
            Para recibir tus pagos, completá tus datos de cobro. Este aviso va a seguir apareciendo hasta que los cargues.
          </p>
          <Link
            href="/vendedor/cobros"
            className="mt-2 inline-block rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:brightness-110"
          >
            Completar datos de cobro
          </Link>
        </div>
      </div>
    </div>
  );
}
