import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StoreHeader from "@/components/StoreHeader";
import ProductCard from "@/components/ProductCard";
import PromoRail from "@/components/PromoRail";
import { CATEGORIES } from "@/lib/categories";
import { serializePromo } from "@/lib/promos";

export const dynamic = "force-dynamic";

export default async function TiendaPage({ searchParams }) {
  const { categoria, q } = await searchParams;
  const query = (q || "").trim();
  const words = query.split(/\s+/).filter(Boolean).slice(0, 6);

  const where = {
    ...(categoria ? { category: categoria } : {}),
    ...(words.length
      ? {
          OR: words.flatMap((w) => [
            { name: { contains: w, mode: "insensitive" } },
            { description: { contains: w, mode: "insensitive" } },
          ]),
        }
      : {}),
  };

  const [products, promoImages] = await Promise.all([
    prisma.product.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        images: { orderBy: { order: "asc" } },
        seller: { select: { storeName: true } },
        reviews: { select: { rating: true } },
        orderItems: { select: { qty: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.promoImage.findMany({ orderBy: { order: "asc" } }),
  ]);
  const promos = promoImages.map(serializePromo);

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 xl:pb-10">
        <h1 className="font-display text-2xl font-bold">Catálogo</h1>
        {query && (
          <p className="mt-1 text-sm text-ink-soft">
            Resultados para <span className="font-semibold">&quot;{query}&quot;</span> ·{" "}
            <Link href={categoria ? `/tienda?categoria=${categoria}` : "/tienda"} className="underline hover:text-ink">
              Quitar búsqueda
            </Link>
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/tienda"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              !categoria ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-steel"
            }`}
          >
            Todos
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda?categoria=${c.slug}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                categoria === c.slug ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-steel"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="mt-10 text-sm text-steel">
            {query ? "No se encontraron productos para tu búsqueda." : "No hay productos en esta categoría todavía."}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <PromoRail promos={promos} />
    </>
  );
}
