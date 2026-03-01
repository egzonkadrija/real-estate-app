"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import {
  ChevronLeft,
  ChevronRight,
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
  Search,
} from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { Property, PropertyImage, Location } from "@/types";
import { cn, getLocalizedField } from "@/lib/utils";

const CATEGORIES = [
  { key: "house", icon: Home },
  { key: "apartment", icon: Building2 },
  { key: "office", icon: Briefcase },
  { key: "land", icon: Mountain },
  { key: "store", icon: Store },
  { key: "warehouse", icon: Warehouse },
  { key: "object", icon: Building },
] as const;
type PropertyFilterKey = "sale" | "rent" | "exclusive";
type CategoryKey = (typeof CATEGORIES)[number]["key"];
type QuickSortKey = "price" | "area" | "location";
type QuickSortOrder = "asc" | "desc";

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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const quickFilterPopoverRef = React.useRef<HTMLDivElement>(null);
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

      // Empty selection means "show all" with no active highlight.
      if (orderedNextFilters.length === 0) {
        return buildHomeHref(
          [],
          activeCategory,
          activeQuickSort,
          activeSortOrder,
          activeMinPrice,
          activeMaxPrice,
          activeMinArea,
          activeMaxArea,
          activeLocationId ?? ""
        );
      }

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

  const getCategoryHref = React.useCallback(
    (category: CategoryKey) => {
      const nextCategory = activeCategory === category ? null : category;
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
      activeCategory,
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

  const getFilterButtonClass = React.useCallback(
    (filter: PropertyFilterKey) => {
      const colorClassByFilter: Record<PropertyFilterKey, string> = {
        sale: "bg-[var(--brand-600)] hover:bg-[var(--brand-700)]",
        rent: "bg-gray-700 hover:bg-gray-800",
        exclusive: "bg-teal-700 hover:bg-teal-800",
      };

      const isActive = isFilterActive(filter);
      const activeClass = "opacity-100 ring-2 ring-offset-1 ring-black/20";
      const inactiveClass = "opacity-60 ring-1 ring-transparent";

      return `rounded-[var(--radius-pill)] px-4 py-2 text-center text-sm font-medium text-white transition-all duration-200 ${colorClassByFilter[filter]} ${isActive ? activeClass : inactiveClass}`;
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
        "flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-sm leading-none transition-colors",
        isQuickFilterActive(quickSort)
          ? "border-[var(--brand-600)] bg-[var(--brand-50)] text-[var(--brand-700)]"
          : "border-[var(--border)] text-gray-700 hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
      ),
    [isQuickFilterActive]
  );

  const [openQuickFilter, setOpenQuickFilter] = React.useState<QuickSortKey | null>(null);
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
        // Intentionally silent; filters still work without preloaded location options.
      }
    }

    void loadLocations();

    return () => {
      ignore = true;
    };
  }, []);

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

  const [search, setSearch] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(-1);
  const sourceCount = properties.length;
  const loopEnabled = sourceCount > 1;
  const loopedProperties = React.useMemo(
    () => (loopEnabled ? [...properties, ...properties, ...properties] : properties),
    [loopEnabled, properties]
  );
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
  }, [properties, locale]);
  const filteredSuggestions = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return propertyNameSuggestions
      .filter((titleValue) => titleValue.toLowerCase().includes(query))
      .slice(0, 8);
  }, [propertyNameSuggestions, search]);
  const pausedRef = React.useRef(false);
  const isHoveringRef = React.useRef(false);
  const moreInfoOpenByCardRef = React.useRef<Record<string, boolean>>({});
  const inertiaFrameRef = React.useRef<number | null>(null);
  const snapFrameRef = React.useRef<number | null>(null);
  const scrollEndTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSnappingRef = React.useRef(false);
  const isInitializingRef = React.useRef(true);
  const dragStateRef = React.useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  function hasMoreInfoOpen() {
    return Object.values(moreInfoOpenByCardRef.current).some(Boolean);
  }

  function syncPauseState() {
    pausedRef.current = isHoveringRef.current
      || dragStateRef.current.isDragging
      || hasMoreInfoOpen();
  }

  const handleMoreInfoToggle = (cardKey: string, isOpen: boolean) => {
    moreInfoOpenByCardRef.current[cardKey] = isOpen;
    syncPauseState();
  };

  function getCardStep(container: HTMLDivElement) {
    const firstCard = container.querySelector<HTMLElement>("[data-card]");
    if (!firstCard) return null;
    const styles = getComputedStyle(container);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return firstCard.offsetWidth + gap;
  }

  function getNearestCardLeft(container: HTMLDivElement) {
    const step = getCardStep(container);
    if (!step) return null;
    const raw = Math.round(container.scrollLeft / step) * step;
    const max = Math.max(0, container.scrollWidth - container.clientWidth);
    return Math.min(Math.max(0, raw), max);
  }

  function getLoopSetWidth(container: HTMLDivElement) {
    const cards = container.querySelectorAll<HTMLElement>("[data-card]");
    if (cards.length <= sourceCount) return 0;
    const measured = cards[sourceCount].offsetLeft - cards[0].offsetLeft;
    if (measured > 0) return measured;
    // Fallback when measurement is not ready yet.
    return container.scrollWidth / 3;
  }

  function recenterIfNeeded(container: HTMLDivElement, force = false) {
    if (!loopEnabled) return;
    const setWidth = getLoopSetWidth(container);
    if (setWidth <= 0) return;

    const minSafe = setWidth * 0.5;
    const maxSafe = setWidth * 2.5;
    if (!force && container.scrollLeft >= minSafe && container.scrollLeft <= maxSafe) {
      return;
    }

    const normalized = ((container.scrollLeft % setWidth) + setWidth) % setWidth;
    container.scrollLeft = setWidth + normalized;
  }

  function animateSnapTo(container: HTMLDivElement, targetLeft: number) {
    if (snapFrameRef.current !== null) {
      cancelAnimationFrame(snapFrameRef.current);
      snapFrameRef.current = null;
    }

    const startLeft = container.scrollLeft;
    const distance = targetLeft - startLeft;
    if (Math.abs(distance) < 1) return;

    const duration = 420;
    const startTime = performance.now();
    isSnappingRef.current = true;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      container.scrollLeft = startLeft + distance * eased;

      if (progress < 1) {
        snapFrameRef.current = requestAnimationFrame(tick);
      } else {
        snapFrameRef.current = null;
        isSnappingRef.current = false;
      }
    };

    snapFrameRef.current = requestAnimationFrame(tick);
  }

  function snapToNearest(container: HTMLDivElement) {
    recenterIfNeeded(container);
    const nearest = getNearestCardLeft(container);
    if (nearest === null) return;
    animateSnapTo(container, nearest);
  }

  function onScroll() {
    const container = scrollRef.current;
    if (!container) return;
    if (hasMoreInfoOpen()) return;
    if (isInitializingRef.current) return;
    if (dragStateRef.current.isDragging || isSnappingRef.current) return;
    recenterIfNeeded(container);

    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current);
    }

    scrollEndTimeoutRef.current = setTimeout(() => {
      if (dragStateRef.current.isDragging || isSnappingRef.current) return;
      if (inertiaFrameRef.current !== null) return;
      snapToNearest(container);
    }, 110);
  }

  function scroll(direction: "left" | "right") {
    if (hasMoreInfoOpen()) return;
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector<HTMLElement>("[data-card]");
    if (!firstCard) return;

    const step = firstCard.offsetWidth + 16;

    if (direction === "right") {
      container.scrollBy({ left: step, behavior: "smooth" });
    } else {
      container.scrollBy({ left: -step, behavior: "smooth" });
    }
  }

  function autoSlide() {
    if (pausedRef.current) return;

    const container = scrollRef.current;
    if (!container) return;
    recenterIfNeeded(container);
    scroll("right");
  }

  function submitSearchQuery(value: string) {
    const query = value.trim();
    if (!query) return;
    setSearch(query);
    setIsSearchFocused(false);
    setActiveSuggestionIndex(-1);
    router.push(`/properties?q=${encodeURIComponent(query)}`);
  }

  React.useEffect(() => {
    const interval = setInterval(autoSlide, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useLayoutEffect(() => {
    const container = scrollRef.current;
    isInitializingRef.current = true;

    if (!container || !loopEnabled) {
      isInitializingRef.current = false;
      return;
    }

    recenterIfNeeded(container, true);
    const nearest = getNearestCardLeft(container);
    if (nearest !== null) {
      container.scrollLeft = nearest;
    }

    const raf = requestAnimationFrame(() => {
      isInitializingRef.current = false;
    });

    return () => {
      cancelAnimationFrame(raf);
      isInitializingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopEnabled, sourceCount, loopedProperties.length]);

  React.useEffect(() => {
    return () => {
      if (inertiaFrameRef.current !== null) {
        cancelAnimationFrame(inertiaFrameRef.current);
      }
      if (snapFrameRef.current !== null) {
        cancelAnimationFrame(snapFrameRef.current);
      }
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, []);

  function startInertia(container: HTMLDivElement, initialVelocity: number) {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }

    let velocity = initialVelocity;
    const friction = 0.95;
    const minVelocity = 0.04;

    const tick = () => {
      if (Math.abs(velocity) < minVelocity) {
        inertiaFrameRef.current = null;
        snapToNearest(container);
        return;
      }
      container.scrollLeft -= velocity * 14;
      recenterIfNeeded(container);
      velocity *= friction;
      inertiaFrameRef.current = requestAnimationFrame(tick);
    };

    inertiaFrameRef.current = requestAnimationFrame(tick);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (hasMoreInfoOpen()) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const container = scrollRef.current;
    if (!container) return;
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
    if (snapFrameRef.current !== null) {
      cancelAnimationFrame(snapFrameRef.current);
      snapFrameRef.current = null;
      isSnappingRef.current = false;
    }
    dragStateRef.current.isDragging = true;
    dragStateRef.current.startX = e.clientX;
    dragStateRef.current.startScrollLeft = container.scrollLeft;
    dragStateRef.current.moved = false;
    dragStateRef.current.lastX = e.clientX;
    dragStateRef.current.lastTime = performance.now();
    dragStateRef.current.velocity = 0;
    syncPauseState();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (hasMoreInfoOpen()) {
      dragStateRef.current.isDragging = false;
      return;
    }
    const container = scrollRef.current;
    const drag = dragStateRef.current;
    if (!container || !drag.isDragging) return;
    const delta = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) <= 5) return;
    if (!drag.moved) {
      drag.moved = true;
      if (!container.hasPointerCapture(e.pointerId)) {
        container.setPointerCapture(e.pointerId);
      }
    }
    e.preventDefault();
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastTime);
    drag.velocity = (e.clientX - drag.lastX) / dt;
    drag.lastX = e.clientX;
    drag.lastTime = now;
    container.scrollLeft = drag.startScrollLeft - delta;
    recenterIfNeeded(container);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (hasMoreInfoOpen()) {
      dragStateRef.current.isDragging = false;
      return;
    }
    const container = scrollRef.current;
    if (!container) return;
    const drag = dragStateRef.current;
    dragStateRef.current.isDragging = false;
    if (container.hasPointerCapture(e.pointerId)) {
      container.releasePointerCapture(e.pointerId);
    }
    if (drag.moved) {
      startInertia(container, drag.velocity);
    } else {
      snapToNearest(container);
    }
    syncPauseState();
  }

  function onClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragStateRef.current.moved) return;
    e.preventDefault();
    e.stopPropagation();
  }

  if (properties.length === 0) return null;

  return (
    <div
      onMouseEnter={() => {
        isHoveringRef.current = true;
        syncPauseState();
      }}
      onMouseLeave={() => {
        isHoveringRef.current = false;
        syncPauseState();
      }}
    >
      <div className="mb-4 w-full overflow-x-auto scrollbar-hide">
        <div className="flex min-w-full items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Link
              href={getFilterHref("sale")}
              className={getFilterButtonClass("sale")}
            >
              {t("property.forSale")}
            </Link>
            <Link
              href={getFilterHref("rent")}
              className={getFilterButtonClass("rent")}
            >
              {t("property.forRent")}
            </Link>
            <Link
              href={getFilterHref("exclusive")}
              className={getFilterButtonClass("exclusive")}
            >
              {t("common.exclusive")}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {CATEGORIES.map(({ key, icon: Icon }) => (
              <Link
                key={key}
                href={getCategoryHref(key)}
                className={cn(
                  "flex flex-shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-sm transition-colors",
                  activeCategory === key
                    ? "border-[var(--brand-600)] bg-[var(--brand-50)] text-[var(--brand-700)]"
                    : "border-[var(--border)] text-gray-700 hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(`property.${key}`)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setOpenQuickFilter((current) =>
                  current === "price" ? null : "price"
                )
              }
              className={getQuickSortButtonClass("price")}
            >
              <CircleDollarSign className="h-4 w-4" />
              {t("property.price")}
            </button>
            <button
              type="button"
              onClick={() =>
                setOpenQuickFilter((current) =>
                  current === "area" ? null : "area"
                )
              }
              className={getQuickSortButtonClass("area")}
            >
              <Maximize2 className="h-4 w-4" />
              {t("property.area")}
            </button>
            <button
              type="button"
              onClick={() =>
                setOpenQuickFilter((current) =>
                  current === "location" ? null : "location"
                )
              }
              className={getQuickSortButtonClass("location")}
            >
              <MapPin className="h-4 w-4" />
              {t("property.location")}
            </button>
          </div>
        </div>

        {openQuickFilter && (
          <div className="relative mt-3">
            <div
              ref={quickFilterPopoverRef}
              className="w-full max-w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-lg"
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

      <div className="mb-4 w-full">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
                if (
                  activeSuggestionIndex >= 0 &&
                  activeSuggestionIndex < filteredSuggestions.length
                ) {
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
            className="w-full rounded-[var(--radius-pill)] border border-[var(--border)] bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--brand-600)]"
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

      <div className="mb-4 flex items-center justify-between gap-3">
        {title && (
          <h2 className="text-2xl font-semibold leading-tight text-gray-900 sm:text-3xl">{title}</h2>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex-shrink-0 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white p-2 text-gray-600 shadow-sm transition-colors hover:border-[var(--brand-600)] hover:bg-[var(--surface-muted)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex-shrink-0 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white p-2 text-gray-600 shadow-sm transition-colors hover:border-[var(--brand-600)] hover:bg-[var(--surface-muted)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        style={{ scrollSnapType: "none" }}
        className="scrollbar-hide flex cursor-grab select-none gap-4 overflow-x-auto py-1 touch-pan-y active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onScroll={onScroll}
        onClickCapture={onClickCapture}
        onDragStartCapture={(e) => e.preventDefault()}
      >
        {loopedProperties.map((property, idx) => (
          <div
            key={`${property.id}-${idx}`}
            data-card
            className="w-[75vw] flex-shrink-0 sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
          >
            <PropertyCard
              property={property}
              isFavorite={isFavorite(property.id)}
              onToggleFavorite={toggleFavorite}
              onMoreInfoToggle={(isOpen) => handleMoreInfoToggle(`${property.id}-${idx}`, isOpen)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
