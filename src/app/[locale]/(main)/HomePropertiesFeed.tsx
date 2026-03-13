"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
  seeMoreText: string;
  loadingMoreText: string;
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
  seeMoreText,
  loadingMoreText,
}: HomePropertiesFeedProps) {
  const PREVIEW_LIMIT = 6;
  const EXPAND_LIMIT = 100;
  const [properties, setProperties] = React.useState<
    Array<Property & { images?: PropertyImage[]; location?: Location }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [isEmpty, setIsEmpty] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(false);
  const [isExpanding, setIsExpanding] = React.useState(false);
  const loadingRef = React.useRef(false);
  const normalizedFilterModes = React.useMemo(
    () =>
      (["sale", "rent", "exclusive"] as const).filter((filter) =>
        filterModes.includes(filter)
      ),
    [filterModes]
  );
  const filterKey = normalizedFilterModes.join(",");
  const skeletonCount = PREVIEW_LIMIT;

  const buildSearchParams = React.useCallback(
    (limit: number, page: number) => {
      const params = new URLSearchParams();
      params.set("status", "active");
      params.set("limit", String(limit));
      params.set("page", String(page));

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

      return params;
    },
    [
      activeCategory,
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

  const fetchPropertiesPage = React.useCallback(
    async (limit: number, page: number) => {
      const res = await fetch(`/api/properties?${buildSearchParams(limit, page).toString()}`);

      if (!res.ok) {
        throw new Error("Failed to load properties");
      }

      const payload = await res.json();
      return {
        nextProperties: Array.isArray(payload.data) ? payload.data : [],
        total: typeof payload.total === "number" ? payload.total : 0,
        totalPages: typeof payload.totalPages === "number" ? payload.totalPages : 0,
      };
    },
    [buildSearchParams]
  );

  const loadPreview = React.useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setFetchError(false);
    setIsExpanding(false);

    try {
      const { nextProperties, total, totalPages } = await fetchPropertiesPage(PREVIEW_LIMIT, 1);
      setProperties(nextProperties);
      setIsEmpty(nextProperties.length === 0);
      setHasMore(total > PREVIEW_LIMIT || totalPages > 1);
    } catch {
      setFetchError(true);
      setProperties([]);
      setHasMore(false);
      setIsEmpty(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchPropertiesPage]);

  React.useEffect(() => {
    setProperties([]);
    setHasMore(true);
    setIsEmpty(false);
    setFetchError(false);
    setIsExpanding(false);
    void loadPreview();
  }, [filterKey, loadPreview]);

  const handleSeeMore = React.useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setIsExpanding(true);
    setFetchError(false);

    try {
      const firstPage = await fetchPropertiesPage(EXPAND_LIMIT, 1);
      let allProperties = firstPage.nextProperties;

      if (firstPage.totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
            fetchPropertiesPage(EXPAND_LIMIT, index + 2)
          )
        );
        allProperties = [...allProperties, ...remainingPages.flatMap((page) => page.nextProperties)];
      }

      setProperties(allProperties);
      setHasMore(false);
      setIsEmpty(allProperties.length === 0);
    } catch {
      setFetchError(true);
    } finally {
      setIsExpanding(false);
      loadingRef.current = false;
    }
  }, [fetchPropertiesPage, hasMore]);

  return (
    <div>
      {isEmpty && !loading && (
        <p className="py-6 text-center text-sm text-gray-500">{noResultsText}</p>
      )}

      {(properties.length > 0 || loading) && (
        <PropertiesGrid
          properties={properties}
          loading={loading && properties.length === 0}
          skeletonCount={skeletonCount}
        />
      )}

      {loading && properties.length === 0 && (
        <p className="sr-only">{loadingText}</p>
      )}

      {fetchError && (
        <p className="py-6 text-center text-sm text-red-500">Unable to load properties.</p>
      )}

      {hasMore && !loading && !isEmpty && (
        <div className="flex justify-center py-6">
          <Button
            type="button"
            onClick={() => void handleSeeMore()}
            disabled={isExpanding}
            className="min-w-32"
          >
            {isExpanding ? loadingMoreText : seeMoreText}
          </Button>
        </div>
      )}
    </div>
  );
}
