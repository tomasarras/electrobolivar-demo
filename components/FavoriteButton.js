"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";

export default function FavoriteButton({ product, className = "" }) {
  const favorites = useFavorites();
  if (!favorites) return null;

  const active = favorites.isFavorite(product.id);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    favorites.toggleFavorite(product);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={active}
      className={`flex items-center justify-center rounded-md border transition ${
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-line bg-paper text-ink-soft hover:border-accent hover:text-accent"
      } ${className}`}
    >
      <Heart size={18} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
