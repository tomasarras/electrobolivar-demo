"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Fixed marketing content (not admin-editable). Add more entries here and
// they join the same 30s rotation automatically.
const PROMOS = [
  { image: "/promo/lavarropas.jpg", alt: "Reparación y service de lavarropas - Refrigeración José Duarte" },
  { image: "/promo/aire-acondicionado.jpg", alt: "Instalación y reparación de aires acondicionados - Refrigeración José Duarte" },
];

const ROTATE_MS = 30000;
const TEL = "tel:2314572888";

// Pinned to the side of the page on wide screens, and as a fixed bottom bar
// on narrower ones — same treatment as the original artifact prototype.
// Shows one promo at a time, rotating through PROMOS every ROTATE_MS.
export default function PromoRail() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (PROMOS.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PROMOS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const promo = PROMOS[index];

  return (
    <aside
      className="fixed z-30 border-line
        bottom-0 left-0 right-0 border-t bg-paper p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.1)]
        xl:bottom-auto xl:left-auto xl:right-4 xl:top-28 xl:w-48 xl:border-t-0 xl:bg-transparent xl:p-0 xl:shadow-none"
    >
      <a href={TEL} className="block overflow-hidden rounded-md border border-line bg-panel">
        <div className="relative h-16 w-full xl:h-auto xl:aspect-square">
          <Image key={promo.image} src={promo.image} alt={promo.alt} fill className="object-cover" sizes="200px" />
        </div>
      </a>
    </aside>
  );
}
