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
import { getLocalizedField } from "@/lib/utils";

const CATEGORIES = [
  { key: "house", icon: Home },
  { key: "apartment", icon: Building2 },
  { key: "office", icon: Briefcase },
  { key: "land", icon: Mountain },
  { key: "store", icon: Store },
  { key: "warehouse", icon: Warehouse },
  { key: "object", icon: Building },
] as const;

interface PropertyCarouselProps {
  properties: (Property & { images?: PropertyImage[]; location?: Location })[];
  title?: string;
  activePropertyFilters?: Array<"sale" | "rent" | "exclusive">;
}

export function PropertyCarousel({
  properties,
  title,
  activePropertyFilters = [],
}: PropertyCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const normalizedPropertyFilters = React.useMemo(() => {
    const orderedFilters: Array<"sale" | "rent" | "exclusive"> = [];
    for (const filter of ["sale", "rent", "exclusive"] as const) {
      if (activePropertyFilters.includes(filter)) {
        orderedFilters.push(filter);
      }
    }
    return orderedFilters;
  }, [activePropertyFilters]);

  const isFilterActive = React.useCallback(
    (filter: "sale" | "rent" | "exclusive") => normalizedPropertyFilters.includes(filter),
    [normalizedPropertyFilters]
  );

  const getFilterHref = React.useCallback(
    (filter: "sale" | "rent" | "exclusive") => {
      const nextFilters = isFilterActive(filter)
        ? normalizedPropertyFilters.filter((value) => value !== filter)
        : [...normalizedPropertyFilters, filter];

      const orderedNextFilters = (["sale", "rent", "exclusive"] as const).filter((value) =>
        nextFilters.includes(value)
      );

      // Empty selection means "show all" with no active highlight.
      if (orderedNextFilters.length === 0) {
        return "?";
      }

      const params = new URLSearchParams();
      for (const value of orderedNextFilters) {
        params.append("propertyFilter", value);
      }
      return `?${params.toString()}`;
    },
    [isFilterActive, normalizedPropertyFilters]
  );

  const getFilterButtonClass = React.useCallback(
    (filter: "sale" | "rent" | "exclusive") => {
      const colorClassByFilter: Record<"sale" | "rent" | "exclusive", string> = {
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
                href={`/properties?category=${key}`}
                className="flex flex-shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] px-3.5 py-1.5 text-sm text-gray-700 transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
              >
                <Icon className="h-4 w-4" />
                {t(`property.${key}`)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/properties"
              className="flex flex-shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] px-3.5 py-1.5 text-sm text-gray-700 transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
            >
              <CircleDollarSign className="h-4 w-4" />
              {t("property.price")}
            </Link>
            <Link
              href="/properties"
              className="flex flex-shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] px-3.5 py-1.5 text-sm text-gray-700 transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
            >
              <Maximize2 className="h-4 w-4" />
              {t("property.area")}
            </Link>
            <Link
              href="/properties"
              className="flex flex-shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] px-3.5 py-1.5 text-sm text-gray-700 transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-700)]"
            >
              <MapPin className="h-4 w-4" />
              {t("property.location")}
            </Link>
          </div>
        </div>
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
