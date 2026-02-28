import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, gte, lte, and, desc, sql, SQL } from "drizzle-orm";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { FilterBar } from "@/components/filters/FilterBar";
import { PropertiesGrid } from "./PropertiesGrid";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Locale } from "@/i18n/routing";
import type { PropertyCategory, PropertyType } from "@/types";

interface PropertiesPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    minArea?: string;
    maxArea?: string;
    locationId?: string;
    rooms?: string;
    page?: string;
  }>;
}

export default async function PropertiesPage({
  params,
  searchParams,
}: PropertiesPageProps) {
  const { locale } = await params;
  const filters = await searchParams;
  const t = await getTranslations({ locale });

  const page = Math.max(1, parseInt(filters.page || "1", 10));
  const limit = ITEMS_PER_PAGE;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions: SQL[] = [eq(properties.status, "active")];

  if (filters.q?.trim()) {
    const term = `%${filters.q.trim()}%`;
    conditions.push(
      sql`(${properties.title_al} ILIKE ${term} OR ${properties.title_en} ILIKE ${term} OR ${properties.title_de} ILIKE ${term})`
    );
  }

  if (filters.type && (filters.type === "sale" || filters.type === "rent")) {
    conditions.push(eq(properties.type, filters.type as PropertyType));
  }

  if (filters.category) {
    conditions.push(
      eq(properties.category, filters.category as PropertyCategory)
    );
  }

  if (filters.minPrice) {
    conditions.push(gte(properties.price, parseInt(filters.minPrice, 10)));
  }

  if (filters.maxPrice) {
    conditions.push(lte(properties.price, parseInt(filters.maxPrice, 10)));
  }

  if (filters.minArea) {
    conditions.push(
      gte(properties.surface_area, parseInt(filters.minArea, 10))
    );
  }

  if (filters.maxArea) {
    conditions.push(
      lte(properties.surface_area, parseInt(filters.maxArea, 10))
    );
  }

  if (filters.locationId) {
    conditions.push(
      eq(properties.location_id, parseInt(filters.locationId, 10))
    );
  }

  if (filters.rooms) {
    conditions.push(gte(properties.rooms, parseInt(filters.rooms, 10)));
  }

  const whereClause = and(...conditions);

  // Fetch properties with relations
  const [propertyResults, allLocations, countResult] = await Promise.all([
    db.query.properties.findMany({
      where: whereClause,
      with: {
        images: true,
        location: true,
      },
      orderBy: [desc(properties.featured), desc(properties.created_at)],
      limit,
      offset,
    }),
    db.query.locations.findMany(),
    db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  // Build pagination URL helper
  function buildPageUrl(p: number) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.type) params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.minArea) params.set("minArea", filters.minArea);
    if (filters.maxArea) params.set("maxArea", filters.maxArea);
    if (filters.locationId) params.set("locationId", filters.locationId);
    if (filters.rooms) params.set("rooms", filters.rooms);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/properties${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        {t("common.properties")}
      </h1>

      {/* Filter Bar */}
      <div className="mb-6">
        <FilterBar locations={allLocations} />
      </div>

      {/* Results Count */}
      <p className="mb-4 text-sm text-gray-500">
        {total} {t("filters.results")}
      </p>

      {/* Properties Grid */}
      {propertyResults.length > 0 ? (
        <PropertiesGrid
          properties={JSON.parse(JSON.stringify(propertyResults))}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-gray-500">{t("common.noResults")}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildPageUrl(page - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t("common.previous")}
              </Link>
            </Button>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 2 && p <= page + 2)
              )
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <Button
                    asChild
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                  >
                    <Link href={buildPageUrl(p)}>{p}</Link>
                  </Button>
                </span>
              ))}
          </div>

          {page < totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildPageUrl(page + 1)}>
                {t("common.next")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
