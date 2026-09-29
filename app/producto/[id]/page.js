import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";
import StoreHeader from "@/components/StoreHeader";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";

export const dynamic = "force-dynamic";

export default async function ProductoPage({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!product) notFound();

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2">
          <ProductGallery images={product.images} alt={product.name} category={product.category} />
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-steel">{categoryLabel(product.category)}</p>
            <h1 className="mt-1 font-display text-2xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-baseline gap-3">
              <p className="font-mono text-xl font-semibold">{formatCurrency(product.price)}</p>
              {product.installments && <p className="font-mono text-sm text-accent-2">{product.installments}</p>}
            </div>
            {product.description && <p className="mt-4 text-ink-soft">{product.description}</p>}
            <AddToCartPanel product={product} />
          </div>
        </div>
      </main>
    </>
  );
}
