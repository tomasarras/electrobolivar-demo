"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/components/FavoritesProvider";

function toProduct(favorite) {
  return {
    id: favorite.productId,
    name: favorite.name,
    price: favorite.price,
    installments: favorite.installments,
    inStock: favorite.inStock,
    category: favorite.category,
    images: favorite.imageUrl ? [{ url: favorite.imageUrl }] : [],
  };
}

export default function FavoritosPage() {
  const favorites = useFavorites();

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold">Favoritos</h1>

        {!favorites?.loaded ? null : favorites.items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-md border border-line bg-panel py-16 text-center">
            <Heart size={28} className="text-steel" />
            <p className="text-sm text-steel">Todavía no marcaste ningún producto como favorito.</p>
            <Link href="/tienda" className="mt-2 rounded-md border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-paper">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {favorites.items.map((f) => (
              <ProductCard key={f.productId} product={toProduct(f)} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
