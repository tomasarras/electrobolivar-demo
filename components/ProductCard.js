import Link from "next/link";
import Image from "next/image";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import { formatCurrency } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";

export default function ProductCard({ product }) {
  const image = product.images?.[0];
  const outOfStock = product.inStock === false;

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-line bg-panel transition hover:-translate-y-0.5 hover:border-steel"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-panel-2">
        <span
          className={`absolute left-2 top-2 z-10 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
            outOfStock ? "border-danger text-danger" : "border-line text-accent-2"
          } bg-paper`}
        >
          {outOfStock ? "Sin stock" : "En stock"}
        </span>
        {image ? (
          <Image src={image.url} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
        ) : (
          <ProductImagePlaceholder category={product.category} className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="font-mono text-[11px] uppercase tracking-wide text-steel">{categoryLabel(product.category)}</span>
        <span className="font-medium leading-snug">{product.name}</span>
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-2">
          <span className="font-mono font-semibold">{formatCurrency(product.price)}</span>
          {product.installments && <span className="font-mono text-xs text-accent-2">{product.installments}</span>}
        </div>
      </div>
    </Link>
  );
}
