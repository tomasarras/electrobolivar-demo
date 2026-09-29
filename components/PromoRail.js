import Image from "next/image";

const PROMOS = [
  { image: "/promo/lavarropas.jpg", alt: "Reparación y service de lavarropas - Refrigeración José Duarte" },
  { image: "/promo/aire-acondicionado.jpg", alt: "Instalación y reparación de aires acondicionados - Refrigeración José Duarte" },
];

const TEL = "tel:2314572888";

// Fixed marketing content (not admin-editable): pinned to the side of the
// page on wide screens, and as a fixed bottom bar on narrower ones — same
// treatment as the original artifact prototype.
export default function PromoRail() {
  return (
    <aside
      className="fixed z-30 flex gap-2 border-line
        bottom-0 left-0 right-0 flex-row border-t bg-paper p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.1)]
        xl:bottom-auto xl:left-auto xl:right-4 xl:top-28 xl:w-48 xl:flex-col xl:border-t-0 xl:bg-transparent xl:p-0 xl:shadow-none"
    >
      {PROMOS.map((promo) => (
        <a key={promo.image} href={TEL} className="block flex-1 overflow-hidden rounded-md border border-line bg-panel xl:flex-none">
          <div className="relative h-16 w-full xl:h-auto xl:aspect-square">
            <Image src={promo.image} alt={promo.alt} fill className="object-cover" sizes="200px" />
          </div>
        </a>
      ))}
    </aside>
  );
}
