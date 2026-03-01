"use client";

import * as React from "react";
import { PropertiesGrid } from "./properties/PropertiesGrid";
import type { Property, PropertyImage, Location } from "@/types";

interface HomePropertiesFeedProps {
  filterModes: Array<"sale" | "rent" | "exclusive">;
  activeCategory:
    | "house"
    | "apartment"
    | "office"
    | "land"
    | "store"
    | "warehouse"
    | "object"
    | null;
  quickSort: "price" | "area" | "location" | null;
  sortOrder: "asc" | "desc" | null;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  locationId: string | null;
  noResultsText: string;
  loadingText: string;
  endOfListText: string;
}

export function HomePropertiesFeed({
  filterModes,
  activeCategory,
  quickSort,
  sortOrder,
  minPrice,
  maxPrice,
  minArea,
  maxArea,
  locationId,
  noResultsText,
  loadingText,
  endOfListText,
}: HomePropertiesFeedProps) {
  const [properties, setProperties] = React.useState<
    Array<Property & { images?: PropertyImage[]; location?: Location }>
  >([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [isEmpty, setIsEmpty] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(false);
  const loaderRef = React.useRef<HTMLDivElement | null>(null);
  const loadingRef = React.useRef(false);
  const normalizedFilterModes = React.useMemo(
    () =>
      (["sale", "rent", "exclusive"] as const).filter((filter) =>
        filterModes.includes(filter)
      ),
    [filterModes]
  );
  const filterKey = normalizedFilterModes.join(",");
  const categoryKey = activeCategory ?? "";
  const sortKey = quickSort ?? "";
  const rangeKey = `${minPrice}-${maxPrice}-${minArea}-${maxArea}`;
  const locationKey = locationId ?? "";

  const limit = 12;
  const skeletonRows = 3;
  const skeletonCardsPerRow = 4;
  const skeletonCount = skeletonRows * skeletonCardsPerRow;

  const loadPage = React.useCallback(
    async (targetPage: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setFetchError(false);

      try {
        const params = new URLSearchParams();
        params.set("status", "active");
        params.set("limit", String(limit));
        params.set("page", String(targetPage));

        if (
          normalizedFilterModes.length > 0 &&
          normalizedFilterModes.length < 3
        ) {
          params.set("homeFilter", normalizedFilterModes.join(","));
        }
        if (activeCategory) {
          params.set("category", activeCategory);
        }
        if (quickSort) {
          params.set("sortBy", quickSort);
        }
        if (sortOrder) {
          params.set("sortOrder", sortOrder);
        }
        if (minPrice) {
          params.set("minPrice", minPrice);
        }
        if (maxPrice) {
          params.set("maxPrice", maxPrice);
        }
        if (minArea) {
          params.set("minArea", minArea);
        }
        if (maxArea) {
          params.set("maxArea", maxArea);
        }
        if (locationId) {
          params.set("locationId", locationId);
        }

        const res = await fetch(
          `/api/properties?${params.toString()}`
        );

        if (!res.ok) {
          throw new Error("Failed to load properties");
        }

        const payload = await res.json();
        const nextProperties = Array.isArray(payload.data) ? payload.data : [];

        if (targetPage === 1 && nextProperties.length === 0) {
          setIsEmpty(true);
        }

        setProperties((previous) =>
          targetPage === 1 ? nextProperties : [...previous, ...nextProperties]
        );

        const totalPages = typeof payload.totalPages === "number"
          ? payload.totalPages
          : 0;
        setHasMore(
          totalPages > 0 ? targetPage < totalPages : nextProperties.length === limit
        );
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [
      activeCategory,
      filterKey,
      locationId,
      maxArea,
      maxPrice,
      minArea,
      minPrice,
      normalizedFilterModes,
      quickSort,
      sortOrder,
    ]
  );

  React.useEffect(() => {
    setProperties([]);
    setPage(1);
    setHasMore(true);
    setIsEmpty(false);
    setFetchError(false);
    void loadPage(1);
  }, [loadPage]);

  React.useEffect(() => {
    if (page === 1) return;
    void loadPage(page);
  }, [loadPage, page]);

  React.useEffect(() => {
    if (!hasMore || loading) return;
    if (!loaderRef.current) return;

      const observer = new IntersectionObserver(
      (entries) => {
        if (loadingRef.current || entries[0]?.isIntersecting === false) {
          return;
        }
        if (entries[0]?.isIntersecting) {
          setPage((previous) => previous + 1);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.25,
      }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [categoryKey, hasMore, loading, filterKey, locationKey, rangeKey, sortKey]);

  return (
    <div>
      {isEmpty && !loading && (
        <p className="py-6 text-center text-sm text-gray-500">{noResultsText}</p>
      )}

      {(properties.length > 0 || loading) && (
        <PropertiesGrid
          properties={properties}
          loading={loading}
          skeletonCount={skeletonCount}
        />
      )}

      {loading && properties.length === 0 && (
        <p className="sr-only">{loadingText}</p>
      )}

      {fetchError && (
        <p className="py-6 text-center text-sm text-red-500">Unable to load properties.</p>
      )}

      {!hasMore && !isEmpty && (
        <p className="py-6 text-center text-sm text-gray-500">{endOfListText}</p>
      )}

      <div ref={loaderRef} className="h-6" />
    </div>
  );
}
