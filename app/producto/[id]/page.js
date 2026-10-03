import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";
import StoreHeader from "@/components/StoreHeader";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import FavoriteButton from "@/components/FavoriteButton";
import StarRating from "@/components/StarRating";
import { averageRating } from "@/lib/reviews";
import { totalSold } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function ProductoPage({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      specs: { orderBy: { order: "asc" } },
      seller: { select: { storeName: true } },
      reviews: { orderBy: { createdAt: "desc" } },
      orderItems: { select: { qty: true } },
    },
  });

  if (!product) notFound();

  const avgRating = averageRating(product.reviews);
  const salesCount = totalSold(product.orderItems);

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2">
          <ProductGallery images={product.images} alt={product.name} category={product.category} />
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs uppercase tracking-wide text-steel">{categoryLabel(product.category)}</p>
                  {product.condition === "usado" && (
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-steel">
                      Usado
                    </span>
                  )}
                </div>
                <h1 className="mt-1 font-display text-2xl font-bold">{product.name}</h1>
              </div>
              <FavoriteButton product={product} className="h-10 w-10 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <p className="font-mono text-xl font-semibold">{formatCurrency(product.price)}</p>
              {product.installments && <p className="font-mono text-sm text-accent-2">{product.installments}</p>}
            </div>
            {product.seller?.storeName && (
              <p className="mt-2 text-sm text-steel">Vendido por {product.seller.storeName}</p>
            )}
            {avgRating && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating value={avgRating} readOnly size={16} />
                <span className="text-sm text-steel">
                  {avgRating.toFixed(1)} ({salesCount} {salesCount === 1 ? "venta" : "ventas"})
                </span>
              </div>
            )}
            {product.description && <p className="mt-4 text-ink-soft">{product.description}</p>}
            <AddToCartPanel product={product} />

            {product.specs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Características</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {product.specs.map((spec) => (
                    <div key={spec.id} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {product.reviews.length > 0 && (
          <div className="mt-12 max-w-2xl">
            <h2 className="font-display text-xl font-bold">Reseñas</h2>
            <ul className="mt-4 space-y-4">
              {product.reviews.map((review) => (
                <li key={review.id} className="rounded-md border border-line bg-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <StarRating value={review.rating} readOnly size={14} />
                    <span className="font-mono text-xs text-steel">
                      {new Date(review.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{review.buyerName || "Comprador verificado"}</p>
                  {review.comment && <p className="mt-1 text-sm text-ink-soft">{review.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}
