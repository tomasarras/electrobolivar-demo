"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";

export default function FavoriteButton({ product, className = "", size = 36 }) {
  const favorites = useFavorites();
  const [count, setCount] = useState(product.favoriteCount ?? 0);
  if (!favorites) return null;

  const active = favorites.isFavorite(product.id);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const wasActive = active;
    favorites.toggleFavorite(product);
    setCount((c) => Math.max(0, c + (wasActive ? -1 : 1)));
    fetch(`/api/products/${product.id}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: wasActive ? "remove" : "add" }),
    }).catch(() => {});
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
        aria-pressed={active}
        style={{ width: size, height: size }}
        className={`flex items-center justify-center rounded-md border transition ${
          active
            ? "border-accent bg-accent text-accent-ink"
            : "border-line bg-paper text-ink-soft hover:border-accent hover:text-accent"
        }`}
      >
        <Heart size={Math.round(size * 0.5)} fill={active ? "currentColor" : "none"} />
      </button>
      {count > 0 && (
        <span className="rounded-full bg-ink px-1.5 py-0.5 font-mono text-[10px] leading-none text-paper">
          {count}
        </span>
      )}
    </div>
  );
}
