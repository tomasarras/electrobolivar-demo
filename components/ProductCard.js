import Link from "next/link";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import FavoriteButton from "@/components/FavoriteButton";
import { formatCurrency, DISCOUNT_PERIOD_LABELS } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";
import { averageRating } from "@/lib/reviews";
import { totalSold } from "@/lib/sales";

export default function ProductCard({ product }) {
  const image = product.images?.[0];
  const outOfStock = (product.stock ?? 0) <= 0;
  const avgRating = averageRating(product.reviews);
  const salesCount = totalSold(product.orderItems);
  const freeShipping =
    product.shipping !== false &&
    (product.freeShippingMinAmount === 0 || (product.freeShippingMinAmount > 0 && product.price >= product.freeShippingMinAmount));

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-line bg-panel transition hover:-translate-y-0.5 hover:border-steel"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-panel-2">
        <span
          className={`absolute left-2 top-2 z-10 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
            outOfStock ? "border-danger text-danger" : "border-line text-accent-2"
          } bg-paper`}
        >
          {outOfStock ? "Sin stock" : "En stock"}
        </span>
        {product.condition === "usado" && (
          <span className="absolute left-2 top-9 z-10 rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-steel">
            Usado
          </span>
        )}
        <FavoriteButton product={product} className="absolute right-2 top-2 z-10 backdrop-blur" size={32} />
        {image ? (
          <Image src={image.url} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
        ) : (
          <ProductImagePlaceholder category={product.category} className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="font-mono text-[10px] uppercase tracking-wide text-steel">{categoryLabel(product.category)}</span>
        <span className="text-sm font-medium leading-snug">{product.name}</span>
        {product.seller?.storeName && (
          <span className="truncate text-[11px] text-steel">Vendido por {product.seller.storeName}</span>
        )}
        {product.location && (
          <span className="flex items-center gap-1 truncate text-[11px] text-steel">
            <MapPin size={11} />
            {product.location}
          </span>
        )}
        {avgRating && (
          <span className="flex items-center gap-1 text-[11px] text-steel">
            <Star size={11} fill="currentColor" className="text-accent" />
            {avgRating.toFixed(1)} ({salesCount})
          </span>
        )}
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-1.5">
          <span className="font-mono text-sm font-semibold">{formatCurrency(product.price, product.currency)}</span>
          {product.installments && <span className="font-mono text-[11px] text-accent-2">{product.installments}</span>}
        </div>
        {product.discountPct && (
          <span className="text-[11px] font-semibold text-danger">
            -{product.discountPct}% {DISCOUNT_PERIOD_LABELS[product.discountPeriod] || ""}
          </span>
        )}
        {freeShipping && <span className="text-[11px] font-semibold text-accent-2">Envío gratis</span>}
      </div>
    </Link>
  );
}
