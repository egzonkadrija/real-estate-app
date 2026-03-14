"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import { Link, useRouter } from "@/i18n/routing";
import {
  ChevronLeft,
  ChevronRight,
  Euro,
  Maximize2,
  MapPin,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { Property, PropertyImage, Location } from "@/types";
import { cn, getLocalizedField } from "@/lib/utils";

const CATEGORIES = [
  "house",
  "apartment",
  "office",
  "land",
  "store",
  "warehouse",
  "object",
] as const;
const CATEGORY_SELECT_ALL_VALUE = "all";

type PropertyFilterKey = "sale" | "rent" | "exclusive";
type CategoryKey = (typeof CATEGORIES)[number];
type QuickSortKey = "price" | "area" | "location";
type QuickSortOrder = "asc" | "desc";

const QUICK_FILTER_POPOVER_MAX_WIDTH = 360;
const QUICK_FILTER_POPOVER_MARGIN = 16;
const QUICK_FILTER_POPOVER_GAP = 12;

interface PropertyCarouselProps {
  properties: (Property & { images?: PropertyImage[]; location?: Location })[];
  title?: string;
  activePropertyFilters?: PropertyFilterKey[];
  activeCategory?: CategoryKey | null;
  activeQuickSort?: QuickSortKey | null;
  activeSortOrder?: QuickSortOrder | null;
  activeMinPrice?: string;
  activeMaxPrice?: string;
  activeMinArea?: string;
  activeMaxArea?: string;
  activeLocationId?: string | null;
}

export function PropertyCarousel({
  properties,
  title,
  activePropertyFilters = [],
  activeCategory = null,
  activeQuickSort = null,
  activeSortOrder = null,
  activeMinPrice = "",
  activeMaxPrice = "",
  activeMinArea = "",
  activeMaxArea = "",
  activeLocationId = null,
}: PropertyCarouselProps) {
  const quickFilterPopoverRef = React.useRef<HTMLDivElement>(null);
  const quickFilterButtonRefs = React.useRef<Record<QuickSortKey, HTMLButtonElement | null>>({
    price: null,
    area: null,
    location: null,
  });
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();

  const normalizedPropertyFilters = React.useMemo(() => {
    const orderedFilters: PropertyFilterKey[] = [];

    for (const filter of ["sale", "rent", "exclusive"] as const) {
      if (activePropertyFilters.includes(filter)) {
        orderedFilters.push(filter);
      }
    }

    return orderedFilters;
  }, [activePropertyFilters]);

  const isFilterActive = React.useCallback(
    (filter: PropertyFilterKey) => normalizedPropertyFilters.includes(filter),
    [normalizedPropertyFilters]
  );

  const buildHomeHref = React.useCallback(
    (
      filters: PropertyFilterKey[],
      category: CategoryKey | null,
      quickSort: QuickSortKey | null,
      sortOrder: QuickSortOrder | null,
      minPrice: string,
      maxPrice: string,
      minArea: string,
      maxArea: string,
      locationId: string
    ) => {
      const params = new URLSearchParams();

      for (const value of filters) {
        params.append("propertyFilter", value);
      }

      if (category) {
        params.set("category", category);
      }
      if (quickSort) {
        params.set("sortBy", quickSort);
      }
      if (sortOrder && (quickSort === "price" || quickSort === "area" || quickSort === "location")) {
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

      const query = params.toString();
      return query ? `?${query}` : "?";
    },
    []
  );

  const getFilterHref = React.useCallback(
    (filter: PropertyFilterKey) => {
      const nextFilters = isFilterActive(filter)
        ? normalizedPropertyFilters.filter((value) => value !== filter)
        : [...normalizedPropertyFilters, filter];

      const orderedNextFilters = (["sale", "rent", "exclusive"] as const).filter((value) =>
        nextFilters.includes(value)
      );

      return buildHomeHref(
        [...orderedNextFilters],
        activeCategory,
        activeQuickSort,
        activeSortOrder,
        activeMinPrice,
        activeMaxPrice,
        activeMinArea,
        activeMaxArea,
        activeLocationId ?? ""
      );
    },
    [
      activeCategory,
      activeLocationId,
      activeMaxArea,
      activeMaxPrice,
      activeMinArea,
      activeMinPrice,
      activeQuickSort,
      activeSortOrder,
      buildHomeHref,
      isFilterActive,
      normalizedPropertyFilters,
    ]
  );

  const getCategorySelectHref = React.useCallback(
    (value: string) => {
      const nextCategory = CATEGORIES.includes(value as CategoryKey)
        ? (value as CategoryKey)
        : null;

      return buildHomeHref(
        normalizedPropertyFilters,
        nextCategory,
        activeQuickSort,
        activeSortOrder,
        activeMinPrice,
        activeMaxPrice,
        activeMinArea,
        activeMaxArea,
        activeLocationId ?? ""
      );
    },
    [
      activeLocationId,
      activeMaxArea,
      activeMaxPrice,
      activeMinArea,
      activeMinPrice,
      activeQuickSort,
      activeSortOrder,
      buildHomeHref,
      normalizedPropertyFilters,
    ]
  );

  const activeCategorySelectValue = activeCategory ?? CATEGORY_SELECT_ALL_VALUE;

  function renderCategorySelect(className?: string) {
    return (
      <Select
        value={activeCategorySelectValue}
        onValueChange={(value) => router.push(getCategorySelectHref(value))}
      >
        <SelectTrigger
          aria-label={t("filters.category")}
          className={cn(
            "h-11 w-full rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-4 text-sm font-medium text-gray-700 ring-0 ring-offset-0 transition-[border-color,box-shadow,background-color,color] hover:border-[color:var(--brand-300)] hover:bg-[color:var(--brand-50)] focus:ring-0 focus:ring-offset-0 data-[state=open]:border-[color:var(--brand-500)] data-[state=open]:bg-[color:var(--brand-50)] data-[state=open]:text-gray-900",
            className
          )}
        >
          <SelectValue placeholder={t("common.all")} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="rounded-3xl border border-[var(--border)] bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
        >
          <SelectItem
            value={CATEGORY_SELECT_ALL_VALUE}
            className="rounded-2xl py-2.5 pl-9 pr-3 text-sm font-medium text-gray-700 focus:bg-[color:var(--brand-50)] focus:text-gray-900"
          >
            {t("common.all")}
          </SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem
              key={category}
              value={category}
              className="rounded-2xl py-2.5 pl-9 pr-3 text-sm font-medium text-gray-700 focus:bg-[color:var(--brand-50)] focus:text-gray-900"
            >
              {t(`property.${category}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const getFilterButtonClass = React.useCallback(
    (filter: PropertyFilterKey) => {
      const colorClassByFilter: Record<PropertyFilterKey, string> = {
        sale: "bg-[var(--brand-600)] hover:bg-[var(--brand-700)]",
        rent: "bg-gray-700 hover:bg-gray-800",
        exclusive: "bg-teal-700 hover:bg-teal-800",
      };

      const activeClass = "opacity-100";
      const inactiveClass = "opacity-60";

      return `inline-flex h-11 w-full min-w-0 items-center justify-center rounded-[var(--radius-pill)] px-2 text-center text-[11px] font-semibold text-white transition-all duration-200 focus:outline-none focus-visible:outline-none focus-visible:ring-0 sm:px-4 sm:text-sm lg:w-auto ${colorClassByFilter[filter]} ${isFilterActive(filter) ? activeClass : inactiveClass}`;
    },
    [isFilterActive]
  );

  const isQuickFilterActive = React.useCallback(
    (quickSort: QuickSortKey) => {
      if (quickSort === "price") {
        return activeQuickSort === "price" || Boolean(activeMinPrice || activeMaxPrice);
      }
      if (quickSort === "area") {
        return activeQuickSort === "area" || Boolean(activeMinArea || activeMaxArea);
      }
      return activeQuickSort === "location" || Boolean(activeLocationId);
    },
    [
      activeLocationId,
      activeMaxArea,
      activeMaxPrice,
      activeMinArea,
      activeMinPrice,
      activeQuickSort,
    ]
  );

  const getQuickSortButtonClass = React.useCallback(
    (quickSort: QuickSortKey) =>
      cn(
        "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[var(--radius-pill)] border text-sm leading-none transition-colors",
        "focus:outline-none focus-visible:outline-none focus-visible:ring-0",
        isQuickFilterActive(quickSort)
          ? "border-[var(--brand-600)] bg-white text-[var(--brand-700)]"
          : "border-[var(--border)] bg-white text-gray-700 hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
      ),
    [isQuickFilterActive]
  );

  const [openQuickFilter, setOpenQuickFilter] = React.useState<QuickSortKey | null>(null);
  const [quickFilterPopoverPosition, setQuickFilterPopoverPosition] = React.useState({
    left: QUICK_FILTER_POPOVER_MARGIN,
    top: 0,
    width: QUICK_FILTER_POPOVER_MAX_WIDTH,
  });
  const [priceMinInput, setPriceMinInput] = React.useState(activeMinPrice);
  const [priceMaxInput, setPriceMaxInput] = React.useState(activeMaxPrice);
  const [priceSortOrder, setPriceSortOrder] = React.useState<QuickSortOrder>(
    activeQuickSort === "price" && activeSortOrder ? activeSortOrder : "desc"
  );
  const [areaMinInput, setAreaMinInput] = React.useState(activeMinArea);
  const [areaMaxInput, setAreaMaxInput] = React.useState(activeMaxArea);
  const [areaSortOrder, setAreaSortOrder] = React.useState<QuickSortOrder>(
    activeQuickSort === "area" && activeSortOrder ? activeSortOrder : "desc"
  );
  const [locationInput, setLocationInput] = React.useState(activeLocationId ?? "");
  const [locationOptions, setLocationOptions] = React.useState<Location[]>([]);
  const [search, setSearch] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(-1);
  const [slidesPerView, setSlidesPerView] = React.useState(1);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    duration: 30,
    breakpoints: {
      "(min-width: 1024px)": {
        dragFree: true,
        duration: 40,
        skipSnaps: true,
      },
    },
    loop: false,
  });

  React.useEffect(() => {
    setPriceMinInput(activeMinPrice);
    setPriceMaxInput(activeMaxPrice);
    setPriceSortOrder(activeQuickSort === "price" && activeSortOrder ? activeSortOrder : "desc");
    setAreaMinInput(activeMinArea);
    setAreaMaxInput(activeMaxArea);
    setAreaSortOrder(activeQuickSort === "area" && activeSortOrder ? activeSortOrder : "desc");
    setLocationInput(activeLocationId ?? "");
  }, [
    activeLocationId,
    activeMaxArea,
    activeMaxPrice,
    activeMinArea,
    activeMinPrice,
    activeQuickSort,
    activeSortOrder,
  ]);

  React.useEffect(() => {
    let ignore = false;

    async function loadLocations() {
      try {
        const res = await fetch("/api/locations?type=city");
        if (!res.ok) return;
        const payload = await res.json();
        if (!ignore && Array.isArray(payload)) {
          setLocationOptions(payload);
        }
      } catch {
        // Filters still work even if location options fail to preload.
      }
    }

    void loadLocations();

    return () => {
      ignore = true;
    };
  }, []);

  React.useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth >= 1024) {
        setSlidesPerView(4);
        return;
      }
      if (window.innerWidth >= 640) {
        setSlidesPerView(2);
        return;
      }
      setSlidesPerView(1);
    };

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);

    return () => {
      window.removeEventListener("resize", updateSlidesPerView);
    };
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;

    const updateNavigationState = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    updateNavigationState();
    emblaApi.on("select", updateNavigationState);
    emblaApi.on("reInit", updateNavigationState);

    return () => {
      emblaApi.off("select", updateNavigationState);
      emblaApi.off("reInit", updateNavigationState);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    if (!openQuickFilter) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!quickFilterPopoverRef.current) return;
      if (quickFilterPopoverRef.current.contains(event.target as Node)) return;
      setOpenQuickFilter(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenQuickFilter(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openQuickFilter]);

  const updateQuickFilterPopoverPosition = React.useCallback(
    (filter: QuickSortKey) => {
      const button = quickFilterButtonRefs.current[filter];
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const width = Math.min(
        QUICK_FILTER_POPOVER_MAX_WIDTH,
        Math.max(0, viewportWidth - QUICK_FILTER_POPOVER_MARGIN * 2)
      );
      const maxLeft = Math.max(
        QUICK_FILTER_POPOVER_MARGIN,
        viewportWidth - width - QUICK_FILTER_POPOVER_MARGIN
      );
      const left = Math.min(Math.max(rect.left, QUICK_FILTER_POPOVER_MARGIN), maxLeft);
      const top = rect.bottom + QUICK_FILTER_POPOVER_GAP;

      setQuickFilterPopoverPosition({ left, top, width });
    },
    []
  );

  React.useEffect(() => {
    if (!openQuickFilter) return;

    const syncPosition = () => updateQuickFilterPopoverPosition(openQuickFilter);
    syncPosition();
    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);

    return () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
    };
  }, [openQuickFilter, updateQuickFilterPopoverPosition]);

  const toggleQuickFilter = React.useCallback(
    (filter: QuickSortKey) => {
      setOpenQuickFilter((current) => {
        const next = current === filter ? null : filter;
        if (next) {
          updateQuickFilterPopoverPosition(next);
        }
        return next;
      });
    },
    [updateQuickFilterPopoverPosition]
  );

  const applyPriceFilters = React.useCallback(() => {
    router.push(
      buildHomeHref(
        normalizedPropertyFilters,
        activeCategory,
        "price",
        priceSortOrder,
        priceMinInput.trim(),
        priceMaxInput.trim(),
        activeMinArea,
        activeMaxArea,
        activeLocationId ?? ""
      )
    );
    setOpenQuickFilter(null);
  }, [
    activeCategory,
    activeLocationId,
    activeMaxArea,
    activeMinArea,
    buildHomeHref,
    normalizedPropertyFilters,
    priceMaxInput,
    priceMinInput,
    priceSortOrder,
    router,
  ]);

  const applyAreaFilters = React.useCallback(() => {
    router.push(
      buildHomeHref(
        normalizedPropertyFilters,
        activeCategory,
        "area",
        areaSortOrder,
        activeMinPrice,
        activeMaxPrice,
        areaMinInput.trim(),
        areaMaxInput.trim(),
        activeLocationId ?? ""
      )
    );
    setOpenQuickFilter(null);
  }, [
    activeCategory,
    activeLocationId,
    activeMaxPrice,
    activeMinPrice,
    areaMaxInput,
    areaMinInput,
    areaSortOrder,
    buildHomeHref,
    normalizedPropertyFilters,
    router,
  ]);

  const applyLocationFilters = React.useCallback(() => {
    router.push(
      buildHomeHref(
        normalizedPropertyFilters,
        activeCategory,
        activeQuickSort,
        activeSortOrder,
        activeMinPrice,
        activeMaxPrice,
        activeMinArea,
        activeMaxArea,
        locationInput
      )
    );
    setOpenQuickFilter(null);
  }, [
    activeCategory,
    activeMaxArea,
    activeMaxPrice,
    activeMinArea,
    activeMinPrice,
    activeQuickSort,
    activeSortOrder,
    buildHomeHref,
    locationInput,
    normalizedPropertyFilters,
    router,
  ]);

  const propertyNameSuggestions = React.useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];

    for (const property of properties) {
      const titleValue = getLocalizedField(property, "title", locale).trim();
      if (!titleValue) continue;
      const key = titleValue.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(titleValue);
    }

    return names;
  }, [locale, properties]);

  const filteredSuggestions = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    return propertyNameSuggestions
      .filter((titleValue) => titleValue.toLowerCase().includes(query))
      .slice(0, 8);
  }, [propertyNameSuggestions, search]);

  const renderPropertyCard = React.useCallback(
    (property: Property & { images?: PropertyImage[]; location?: Location }, key: string) => (
      <div
        key={key}
        className="min-w-0 flex-[0_0_100%] px-1 sm:flex-[0_0_50%] lg:flex-[0_0_25%]"
      >
        <PropertyCard
          property={property}
          isFavorite={isFavorite(property.id)}
          onToggleFavorite={toggleFavorite}
          variant="featured"
        />
      </div>
    ),
    [isFavorite, toggleFavorite]
  );

  const handleScrollPrev = React.useCallback(() => {
    if (!emblaApi) return;
    const targetIndex = Math.max(0, emblaApi.selectedScrollSnap() - slidesPerView);
    emblaApi.scrollTo(targetIndex);
  }, [emblaApi, slidesPerView]);

  const handleScrollNext = React.useCallback(() => {
    if (!emblaApi) return;
    const targetIndex = Math.min(
      properties.length - 1,
      emblaApi.selectedScrollSnap() + slidesPerView
    );
    emblaApi.scrollTo(targetIndex);
  }, [emblaApi, properties.length, slidesPerView]);

  function submitSearchQuery(value: string) {
    const query = value.trim();
    if (!query) return;
    setSearch(query);
    setIsSearchFocused(false);
    setActiveSuggestionIndex(-1);
    router.push(`/properties?q=${encodeURIComponent(query)}`);
  }

  if (properties.length === 0) return null;

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden">
      <div className="mb-3 flex flex-wrap items-center gap-3 sm:mb-4">
        {title && (
          <h2 className="min-w-0 flex-1 text-xl font-semibold leading-tight text-gray-900 sm:text-3xl">
            {title}
          </h2>
        )}
      </div>

      <div className="mb-3 w-full space-y-2 sm:mb-4 sm:space-y-3 lg:space-y-0">
        <div className="flex w-full min-w-0 flex-col gap-2 lg:flex-row lg:flex-nowrap lg:items-center lg:gap-3">
          <div className="grid w-full min-w-0 grid-cols-3 gap-2 lg:flex lg:w-auto lg:flex-nowrap lg:items-center lg:gap-2 lg:shrink-0">
            <Link href={getFilterHref("sale")} className={getFilterButtonClass("sale")}>
              {t("property.forSale")}
            </Link>
            <Link href={getFilterHref("rent")} className={getFilterButtonClass("rent")}>
              {t("property.forRent")}
            </Link>
            <Link href={getFilterHref("exclusive")} className={getFilterButtonClass("exclusive")}>
              {t("common.exclusive")}
            </Link>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-2 lg:ml-auto lg:w-auto lg:flex-1 lg:flex-row lg:items-center lg:justify-end">
            <div className="flex w-full min-w-0 items-center gap-2 lg:w-auto lg:flex-none">
              <div className="min-w-0 flex-1 lg:hidden">
                {renderCategorySelect("w-full")}
              </div>

              <div className="relative flex flex-shrink-0 items-center gap-2">
              <button
                ref={(node) => {
                  quickFilterButtonRefs.current.price = node;
                }}
                type="button"
                onClick={() => toggleQuickFilter("price")}
                aria-label={t("property.price")}
                title={t("property.price")}
                className={getQuickSortButtonClass("price")}
              >
                <Euro className="h-4 w-4" />
              </button>
              <button
                ref={(node) => {
                  quickFilterButtonRefs.current.area = node;
                }}
                type="button"
                onClick={() => toggleQuickFilter("area")}
                aria-label={t("property.area")}
                title={t("property.area")}
                className={getQuickSortButtonClass("area")}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                ref={(node) => {
                  quickFilterButtonRefs.current.location = node;
                }}
                type="button"
                onClick={() => toggleQuickFilter("location")}
                aria-label={t("property.location")}
                title={t("property.location")}
                className={getQuickSortButtonClass("location")}
              >
                <MapPin className="h-4 w-4" />
              </button>

              {openQuickFilter && (
                <div
                  className="fixed z-40"
                  style={{
                    left: `${quickFilterPopoverPosition.left}px`,
                    top: `${quickFilterPopoverPosition.top}px`,
                    width: `${quickFilterPopoverPosition.width}px`,
                  }}
                >
                  <div
                    ref={quickFilterPopoverRef}
                    className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-lg"
                  >
                    {openQuickFilter === "price" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t("property.price")}</h3>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <input
                            type="number"
                            value={priceMinInput}
                            onChange={(e) => setPriceMinInput(e.target.value)}
                            placeholder={t("filters.minPrice")}
                            className="w-full min-w-0 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand-600)]"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="number"
                            value={priceMaxInput}
                            onChange={(e) => setPriceMaxInput(e.target.value)}
                            placeholder={t("filters.maxPrice")}
                            className="w-full min-w-0 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand-600)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Sort by</p>
                          <label className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-1 text-sm text-gray-700">
                            <span>Low to High</span>
                            <input
                              type="radio"
                              name="price-sort-order"
                              checked={priceSortOrder === "asc"}
                              onChange={() => setPriceSortOrder("asc")}
                            />
                          </label>
                          <label className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-1 text-sm text-gray-700">
                            <span>High to Low</span>
                            <input
                              type="radio"
                              name="price-sort-order"
                              checked={priceSortOrder === "desc"}
                              onChange={() => setPriceSortOrder("desc")}
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={applyPriceFilters}
                          className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    {openQuickFilter === "area" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t("property.area")}</h3>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <input
                            type="number"
                            value={areaMinInput}
                            onChange={(e) => setAreaMinInput(e.target.value)}
                            placeholder={t("filters.minArea")}
                            className="w-full min-w-0 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand-600)]"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="number"
                            value={areaMaxInput}
                            onChange={(e) => setAreaMaxInput(e.target.value)}
                            placeholder={t("filters.maxArea")}
                            className="w-full min-w-0 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand-600)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Sort by</p>
                          <label className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-1 text-sm text-gray-700">
                            <span>Low to High</span>
                            <input
                              type="radio"
                              name="area-sort-order"
                              checked={areaSortOrder === "asc"}
                              onChange={() => setAreaSortOrder("asc")}
                            />
                          </label>
                          <label className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-1 text-sm text-gray-700">
                            <span>High to Low</span>
                            <input
                              type="radio"
                              name="area-sort-order"
                              checked={areaSortOrder === "desc"}
                              onChange={() => setAreaSortOrder("desc")}
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={applyAreaFilters}
                          className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    {openQuickFilter === "location" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t("property.location")}</h3>
                        <select
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand-600)]"
                        >
                          <option value="">{t("common.all")}</option>
                          {locationOptions.map((location) => (
                            <option key={location.id} value={String(location.id)}>
                              {getLocalizedField(location, "name", locale)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={applyLocationFilters}
                          className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>

              <div className="hidden w-full min-w-0 lg:block lg:w-[11rem] lg:shrink-0">
                {renderCategorySelect("w-full")}
              </div>
            </div>

            <div className="relative min-w-0 w-full lg:max-w-[22rem] lg:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:h-5 sm:w-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveSuggestionIndex(-1);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setIsSearchFocused(false);
                    setActiveSuggestionIndex(-1);
                  }, 100);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" && filteredSuggestions.length > 0) {
                    e.preventDefault();
                    setIsSearchFocused(true);
                    setActiveSuggestionIndex((prev) =>
                      prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                    );
                    return;
                  }

                  if (e.key === "ArrowUp" && filteredSuggestions.length > 0) {
                    e.preventDefault();
                    setIsSearchFocused(true);
                    setActiveSuggestionIndex((prev) =>
                      prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                    );
                    return;
                  }

                  if (e.key === "Escape") {
                    setIsSearchFocused(false);
                    setActiveSuggestionIndex(-1);
                    return;
                  }

                  if (e.key === "Enter") {
                    if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredSuggestions.length) {
                      e.preventDefault();
                      submitSearchQuery(filteredSuggestions[activeSuggestionIndex]);
                      return;
                    }
                    if (search.trim()) {
                      submitSearchQuery(search);
                    }
                  }
                }}
                placeholder={t("hero.searchPlaceholder")}
                className="h-11 w-full rounded-[var(--radius-pill)] border border-[var(--border)] bg-white py-0 pl-9 pr-4 text-sm outline-none transition-colors focus:border-[var(--brand-600)] sm:pl-10"
              />
              {isSearchFocused && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-lg">
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {filteredSuggestions.map((suggestion, index) => (
                      <li key={suggestion}>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            submitSearchQuery(suggestion);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                            index === activeSuggestionIndex
                              ? "bg-[var(--surface-muted)] text-[var(--brand-700)]"
                              : "text-gray-700 hover:bg-[var(--surface-muted)]"
                          }`}
                        >
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="-mx-1 flex touch-pan-y">
            {properties.map((property, idx) =>
              renderPropertyCard(property, `${property.id}-carousel-${idx}`)
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 sm:mt-4">
        <button
          type="button"
          onClick={handleScrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous featured properties"
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
            canScrollPrev
              ? "border-[var(--border)] bg-white text-gray-700 hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
              : "border-gray-200 bg-gray-100 text-gray-300"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleScrollNext}
          disabled={!canScrollNext}
          aria-label="Next featured properties"
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
            canScrollNext
              ? "border-[var(--border)] bg-white text-gray-700 hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
              : "border-gray-200 bg-gray-100 text-gray-300"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
