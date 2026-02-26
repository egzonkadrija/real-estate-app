"use client";

import { useCallback, useSyncExternalStore } from "react";

const FAVORITES_KEY = "realestate-favorites";
const FAVORITES_EVENT = "favorites:updated";
const EMPTY_FAVORITES: number[] = [];
const listeners = new Set<() => void>();
let favoritesCache: number[] | null = null;

function parseFavorites(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
}

function readFavorites(): number[] {
  if (typeof window === "undefined") return [];
  return parseFavorites(window.localStorage.getItem(FAVORITES_KEY));
}

function getFavoritesSnapshot() {
  if (favoritesCache === null) {
    favoritesCache = readFavorites();
  }
  return favoritesCache;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setFavorites(next: number[]) {
  if (typeof window === "undefined") return;
  favoritesCache = next;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  function syncFromStorage() {
    favoritesCache = readFavorites();
    emitChange();
  }

  function handleStorage(event: StorageEvent) {
    if (event.key !== FAVORITES_KEY) return;
    syncFromStorage();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(FAVORITES_EVENT, syncFromStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(FAVORITES_EVENT, syncFromStorage);
  };
}

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribe,
    getFavoritesSnapshot,
    () => EMPTY_FAVORITES
  );

  const toggleFavorite = useCallback((propertyId: number) => {
    const next = favorites.includes(propertyId)
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId];
    setFavorites(next);
  }, [favorites]);

  const isFavorite = useCallback(
    (propertyId: number) => favorites.includes(propertyId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
