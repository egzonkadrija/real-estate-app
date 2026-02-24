"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Search,
  SlidersHorizontal,
  Home,
  Building2,
  Briefcase,
  Mountain,
  Store,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "house", icon: Home },
  { key: "apartment", icon: Building2 },
  { key: "office", icon: Briefcase },
  { key: "land", icon: Mountain },
  { key: "store", icon: Store },
  { key: "warehouse", icon: Warehouse },
] as const;

export function HomeFilterBar() {
  const t = useTranslations();
  const [search, setSearch] = React.useState("");

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Type pills + Category icons row */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
          {/* Type pills */}
          <Link
            href="/properties?type=sale"
            className="flex-shrink-0 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            {t("property.forSale")}
          </Link>
          <Link
            href="/properties?type=rent"
            className="flex-shrink-0 rounded-full bg-rose-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-700"
          >
            {t("property.forRent")}
          </Link>
          <Link
            href="/properties?featured=true"
            className="flex-shrink-0 rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            {t("common.exclusive")}
          </Link>

          {/* Separator */}
          <div className="mx-1 h-6 w-px flex-shrink-0 bg-gray-200" />

          {/* Category icons */}
          {CATEGORIES.map(({ key, icon: Icon }) => (
            <Link
              key={key}
              href={`/properties?category=${key}`}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-amber-400 hover:text-amber-600"
            >
              <Icon className="h-4 w-4" />
              {t(`property.${key}`)}
            </Link>
          ))}

          {/* Filter shortcuts */}
          <div className="mx-1 h-6 w-px flex-shrink-0 bg-gray-200" />
          <Link
            href="/properties"
            className="flex flex-shrink-0 items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
          >
            {t("filters.priceRange")}
          </Link>
          <Link
            href="/properties"
            className="flex flex-shrink-0 items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
          >
            {t("property.area")}
          </Link>
          <Link
            href="/properties"
            className="flex flex-shrink-0 items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
          >
            {t("filters.location")}
          </Link>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  window.location.href = `/properties?q=${encodeURIComponent(search.trim())}`;
                }
              }}
              placeholder={t("hero.searchPlaceholder")}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-amber-400 focus:bg-white"
            />
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("common.filter")}
          </Link>
        </div>
      </div>
    </div>
  );
}
