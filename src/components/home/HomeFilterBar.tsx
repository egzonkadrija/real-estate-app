"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Search,
  SlidersHorizontal,
  Home,
  Building2,
  Building,
  Briefcase,
  Mountain,
  Store,
  Warehouse,
  CircleDollarSign,
  Maximize2,
  MapPin,
} from "lucide-react";

const CATEGORIES = [
  { key: "house", icon: Home },
  { key: "apartment", icon: Building2 },
  { key: "office", icon: Briefcase },
  { key: "land", icon: Mountain },
  { key: "store", icon: Store },
  { key: "warehouse", icon: Warehouse },
  { key: "object", icon: Building },
] as const;

export function HomeFilterBar() {
  const t = useTranslations();
  const [search, setSearch] = React.useState("");

  return (
    <div className="sticky top-20 z-[60] w-full overflow-hidden border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-[1440px] px-4">
        {/* Type pills + Category icons row */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
          {/* Type pills */}
          <Link
            href="/properties?type=sale"
            className="flex-shrink-0 rounded-[var(--radius-pill)] bg-[var(--brand-600)] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-700)]"
          >
            {t("property.forSale")}
          </Link>
          <Link
            href="/properties?type=rent"
            className="flex-shrink-0 rounded-[var(--radius-pill)] bg-gray-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            {t("property.forRent")}
          </Link>
          <Link
            href="/properties?featured=true"
            className="flex-shrink-0 rounded-[var(--radius-pill)] bg-teal-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
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
              className="flex flex-shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
            >
              <Icon className="h-4 w-4" />
              {t(`property.${key}`)}
            </Link>
          ))}

          {/* Separator */}
          <div className="mx-1 h-6 w-px flex-shrink-0 bg-gray-200" />

          {/* Filter shortcuts */}
          <Link
            href="/properties"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
          >
            <CircleDollarSign className="h-4 w-4" />
            {t("property.price")}
          </Link>
          <Link
            href="/properties"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
          >
            <Maximize2 className="h-4 w-4" />
            {t("property.area")}
          </Link>
          <Link
            href="/properties"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
          >
            <MapPin className="h-4 w-4" />
            {t("property.location")}
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
              className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--brand-600)] focus:bg-[var(--surface)]"
            />
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-[var(--surface-muted)]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("common.filter")}
          </Link>
        </div>
      </div>
    </div>
  );
}
