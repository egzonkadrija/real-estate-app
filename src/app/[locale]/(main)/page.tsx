import { getTranslations } from "next-intl/server";
import { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Send } from "lucide-react";
import { PropertyCarousel } from "@/components/home/PropertyCarousel";
import { HeroCTAActions } from "@/components/home/HeroCTAActions";
import { HomePropertiesFeed } from "./HomePropertiesFeed";

const HOME_CATEGORY_FILTERS = [
  "house",
  "apartment",
  "office",
  "land",
  "store",
  "warehouse",
  "object",
] as const;
type HomeCategoryFilter = (typeof HOME_CATEGORY_FILTERS)[number];
type HomeQuickSort = "price" | "area" | "location";
type HomeSortOrder = "asc" | "desc";
type HomePageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: HomePageSearchParams;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawPropertyFilters = Array.isArray(resolvedSearchParams.propertyFilter)
    ? resolvedSearchParams.propertyFilter
    : typeof resolvedSearchParams.propertyFilter === "string"
      ? resolvedSearchParams.propertyFilter.split(",")
      : [];
  const activePropertyFilters = (["sale", "rent", "exclusive"] as const).filter((filter) =>
    rawPropertyFilters.includes(filter)
  );
  const rawCategory = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0]
    : resolvedSearchParams.category;
  const activeCategory =
    typeof rawCategory === "string" &&
    (HOME_CATEGORY_FILTERS as readonly string[]).includes(rawCategory)
      ? (rawCategory as HomeCategoryFilter)
      : null;
  const rawSortBy = Array.isArray(resolvedSearchParams.sortBy)
    ? resolvedSearchParams.sortBy[0]
    : resolvedSearchParams.sortBy;
  const activeQuickSort =
    rawSortBy === "price" || rawSortBy === "area" || rawSortBy === "location"
      ? (rawSortBy as HomeQuickSort)
      : null;
  const rawSortOrder = Array.isArray(resolvedSearchParams.sortOrder)
    ? resolvedSearchParams.sortOrder[0]
    : resolvedSearchParams.sortOrder;
  const activeSortOrder =
    rawSortOrder === "asc" || rawSortOrder === "desc"
      ? (rawSortOrder as HomeSortOrder)
      : null;
  const activeMinPrice = Array.isArray(resolvedSearchParams.minPrice)
    ? resolvedSearchParams.minPrice[0] ?? ""
    : resolvedSearchParams.minPrice ?? "";
  const activeMaxPrice = Array.isArray(resolvedSearchParams.maxPrice)
    ? resolvedSearchParams.maxPrice[0] ?? ""
    : resolvedSearchParams.maxPrice ?? "";
  const activeMinArea = Array.isArray(resolvedSearchParams.minArea)
    ? resolvedSearchParams.minArea[0] ?? ""
    : resolvedSearchParams.minArea ?? "";
  const activeMaxArea = Array.isArray(resolvedSearchParams.maxArea)
    ? resolvedSearchParams.maxArea[0] ?? ""
    : resolvedSearchParams.maxArea ?? "";
  const activeLocationId = Array.isArray(resolvedSearchParams.locationId)
    ? resolvedSearchParams.locationId[0] ?? null
    : resolvedSearchParams.locationId ?? null;

  let featuredProperties: Awaited<ReturnType<typeof db.query.properties.findMany>> = [];

  try {
    featuredProperties = await db.query.properties.findMany({
      where: and(
        eq(properties.featured, true),
        eq(properties.status, "active")
      ),
      with: {
        images: true,
        location: true,
      },
      orderBy: [desc(properties.created_at)],
      limit: 12,
    });
  } catch {
    // Keep homepage render resilient when DB is temporarily unavailable.
  }

  return (
    <div>
      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-4 pb-3 pt-4 sm:pb-4 sm:pt-8">
          <div className="w-full max-w-full overflow-x-hidden pt-3 sm:pt-5">
            <PropertyCarousel
              properties={JSON.parse(JSON.stringify(featuredProperties))}
              title={t("property.featured")}
              activePropertyFilters={[...activePropertyFilters]}
              activeCategory={activeCategory}
              activeQuickSort={activeQuickSort}
              activeSortOrder={activeSortOrder}
              activeMinPrice={activeMinPrice}
              activeMaxPrice={activeMaxPrice}
              activeMinArea={activeMinArea}
              activeMaxArea={activeMaxArea}
              activeLocationId={activeLocationId}
            />
          </div>
        </section>
      )}

      {/* All Properties */}
      <section className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-4 py-5 sm:py-8">
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h2 className="text-xl font-semibold leading-tight text-gray-900 sm:text-3xl">
            {t("property.otherProperties")}
          </h2>
        </div>
        <HomePropertiesFeed
          filterModes={[...activePropertyFilters]}
          activeCategory={activeCategory}
          quickSort={activeQuickSort}
          sortOrder={activeSortOrder}
          minPrice={activeMinPrice}
          maxPrice={activeMaxPrice}
          minArea={activeMinArea}
          maxArea={activeMaxArea}
          locationId={activeLocationId}
          noResultsText={t("common.noResults")}
          loadingText="Loading properties..."
          seeMoreText={t("common.viewAll")}
          loadingMoreText={t("common.loading")}
        />
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:py-16">
          <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-5 text-white sm:p-12">
            <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3">
              <Send className="h-8 w-8 text-amber-400 sm:h-10 sm:w-10" />
              <HeroCTAActions
                submitLabel={t("common.submitProperty")}
                requestLabel={t("common.requestProperty")}
                showSubmitRequest={false}
                compact
              />
            </div>
            <h2 className="mb-2 text-center text-xl font-bold sm:mb-3 sm:text-3xl">
              {t("form.submitProperty")}
            </h2>
            <p className="mx-auto mb-5 max-w-2xl whitespace-pre-line text-center text-sm text-gray-300 sm:mb-6 sm:text-base">
              {t("footer.description")}
            </p>
          <HeroCTAActions
            submitLabel={t("common.submitProperty")}
            requestLabel={t("common.requestProperty")}
          />
        </div>
      </section>
    </div>
  );
}
