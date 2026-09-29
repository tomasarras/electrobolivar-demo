"use client";

import { useState } from "react";
import Image from "next/image";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";

export default function ProductGallery({ images, alt, category }) {
  const [active, setActive] = useState(0);
  const list = images || [];
  const current = list[active];

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-line bg-panel-2">
        {current ? (
          <Image src={current.url} alt={alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
        ) : (
          <ProductImagePlaceholder category={category} className="h-full w-full" />
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2">
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-14 w-14 overflow-hidden rounded border ${
                i === active ? "border-accent ring-1 ring-accent" : "border-line"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
