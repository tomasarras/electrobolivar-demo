"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "mercadobolivar_favorites";

const FavoritesContext = createContext(null);

function loadFavorites() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadFavorites());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function isFavorite(productId) {
    return items.some((i) => i.productId === productId);
  }

  function toggleFavorite(product) {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) {
        return prev.filter((i) => i.productId !== product.id);
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          installments: product.installments || null,
          inStock: product.inStock !== false,
          category: product.category,
          imageUrl: product.images?.[0]?.url || null,
        },
      ];
    });
  }

  function removeFavorite(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  return (
    <FavoritesContext.Provider
      value={{ items, loaded, isFavorite, toggleFavorite, removeFavorite, count: items.length }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
