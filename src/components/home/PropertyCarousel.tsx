"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { Property, PropertyImage, Location } from "@/types";

interface PropertyCarouselProps {
  properties: (Property & { images?: PropertyImage[]; location?: Location })[];
  title?: string;
}

export function PropertyCarousel({ properties, title }: PropertyCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  function scroll(direction: "left" | "right") {
    const container = scrollRef.current;
    if (!container) return;

    const cards = Array.from(container.children) as HTMLElement[];
    if (cards.length === 0) return;

    let nextIndex = currentIndex;
    if (direction === "right" && currentIndex < cards.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === "left" && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    cards[nextIndex].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });

    setCurrentIndex(nextIndex);
  }

  if (properties.length === 0) return null;

  return (
    <div>
      {/* Header with title and arrows */}
      <div className="mb-4 flex items-center justify-between">
        {title && (
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="rounded-full border border-gray-200 p-2 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full border border-gray-200 p-2 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto"
      >
        {properties.map((property) => (
          <div
            key={property.id}
            className="w-[280px] flex-shrink-0 sm:w-[300px]"
          >
            <PropertyCard
              property={property}
              isFavorite={isFavorite(property.id)}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
