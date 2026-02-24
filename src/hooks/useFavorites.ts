"use client";

import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "realestate-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const toggleFavorite = useCallback((propertyId: number) => {
    setFavorites((prev) => {
      const next = prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (propertyId: number) => favorites.includes(propertyId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
