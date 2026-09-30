"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const ROTATE_MS = 30000;
const TEL = "tel:2314572888";

// Pinned to the side of the page on wide screens, and as a fixed bottom bar
// on narrower ones. Each promo ships a separate mobile (wide banner) and
// desktop (tall 9:16 panel) image, managed from Admin → Configuración, since
// the two slots are different fixed shapes and one crop never fits both.
export default function PromoRail({ promos }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!promos || promos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % promos.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [promos]);

  if (!promos || promos.length === 0) return null;

  const promo = promos[index % promos.length];

  return (
    <aside
      className="fixed z-30 border-line
        bottom-0 left-0 right-0 border-t bg-paper p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.1)]
        xl:bottom-auto xl:left-auto xl:right-4 xl:top-28 xl:w-48 xl:border-t-0 xl:bg-transparent xl:p-0 xl:shadow-none"
    >
      <a href={TEL} className="block overflow-hidden rounded-md border border-line bg-panel">
        <div className="relative h-24 w-full xl:hidden">
          <Image key={promo.mobileUrl} src={promo.mobileUrl} alt={promo.alt} fill className="object-cover object-center" sizes="100vw" />
        </div>
        <div className="relative hidden xl:block xl:aspect-[9/16]">
          <Image key={promo.desktopUrl} src={promo.desktopUrl} alt={promo.alt} fill className="object-cover object-top" sizes="200px" />
        </div>
      </a>
    </aside>
  );
}
