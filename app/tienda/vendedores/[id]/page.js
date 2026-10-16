import { notFound } from "next/navigation";
import Link from "next/link";
import { Store, Star, TriangleAlert, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StoreHeader from "@/components/StoreHeader";
import ProductCard from "@/components/ProductCard";
import { averageRating } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function VendedorPublicoPage({ params }) {
  const { id } = await params;

  const seller = await prisma.seller.findUnique({
    where: { id },
    select: { id: true, storeName: true, createdAt: true, flaggedFraud: true },
  });

  if (!seller) notFound();

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: {
      images: { orderBy: { order: "asc" } },
      seller: { select: { storeName: true } },
      reviews: { select: { rating: true } },
      orderItems: { select: { qty: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const allRatings = products.flatMap((p) => p.reviews);
  const avgRating = averageRating(allRatings);
  const salesCount = products.reduce(
    (sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.qty, 0),
    0
  );

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 xl:pb-10">
        <div className="flex items-center gap-4 rounded-md border border-line bg-panel p-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-ink text-paper">
            <Store size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold">{seller.storeName}</h1>
            {seller.flaggedFraud && (
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-danger">
                <TriangleAlert size={14} />
                Posible fraude — recibió quejas de otros compradores
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-steel">
              {avgRating && (
                <span className="flex items-center gap-1">
                  <Star size={14} fill="currentColor" className="text-accent" />
                  {avgRating.toFixed(1)} ({salesCount} {salesCount === 1 ? "venta" : "ventas"})
                </span>
              )}
              <span>
                {products.length} {products.length === 1 ? "producto publicado" : "productos publicados"}
              </span>
            </div>
          </div>
          <Link
            href={`/perfil/mensajes/${seller.id}`}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm font-semibold hover:border-steel"
          >
            <MessageSquare size={15} />
            Enviar mensaje
          </Link>
        </div>

        <h2 className="mt-8 font-display text-lg font-bold">Productos de {seller.storeName}</h2>
        {products.length === 0 ? (
          <p className="mt-4 text-sm text-steel">Todavía no publicó productos.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
