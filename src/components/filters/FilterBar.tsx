"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocalizedField } from "@/lib/utils";
import { PROPERTY_CATEGORIES } from "@/lib/constants";
import type { Location } from "@/types";

interface FilterBarProps {
  locations?: Location[];
}

export function FilterBar({ locations = [] }: FilterBarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = React.useState(false);

  const currentType = searchParams.get("type") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentMinArea = searchParams.get("minArea") || "";
  const currentMaxArea = searchParams.get("maxArea") || "";
  const currentLocation = searchParams.get("locationId") || "";
  const currentRooms = searchParams.get("rooms") || "";

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasActiveFilters =
    currentType ||
    currentCategory ||
    currentMinPrice ||
    currentMaxPrice ||
    currentMinArea ||
    currentMaxArea ||
    currentLocation ||
    currentRooms;

  const states = locations.filter((l) => l.type === "state");
  const cities = locations.filter((l) => l.type === "city");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Type Pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => updateFilters({ type: "" })}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            !currentType
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {t("common.all")}
        </button>
        <button
          onClick={() => updateFilters({ type: "sale" })}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            currentType === "sale"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {t("property.forSale")}
        </button>
        <button
          onClick={() => updateFilters({ type: "rent" })}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            currentType === "rent"
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {t("property.forRent")}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("common.filter")}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              {t("filters.clearAll")}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t("filters.category")}
            </label>
            <select
              value={currentCategory}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t("common.all")}</option>
              {PROPERTY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`property.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t("filters.priceRange")}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={t("filters.minPrice")}
                value={currentMinPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder={t("filters.maxPrice")}
                value={currentMaxPrice}
                onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Area Range */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t("filters.areaRange")}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={t("filters.minArea")}
                value={currentMinArea}
                onChange={(e) => updateFilters({ minArea: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder={t("filters.maxArea")}
                value={currentMaxArea}
                onChange={(e) => updateFilters({ maxArea: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t("filters.location")}
            </label>
            <select
              value={currentLocation}
              onChange={(e) => updateFilters({ locationId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t("common.all")}</option>
              {states.map((state) => (
                <optgroup
                  key={state.id}
                  label={getLocalizedField(state, "name", locale)}
                >
                  {cities
                    .filter((c) => c.parent_id === state.id)
                    .map((city) => (
                      <option key={city.id} value={city.id}>
                        {getLocalizedField(city, "name", locale)}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Rooms */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t("filters.rooms")}
            </label>
            <select
              value={currentRooms}
              onChange={(e) => updateFilters({ rooms: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t("common.all")}</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
