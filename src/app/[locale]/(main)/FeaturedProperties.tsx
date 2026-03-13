"use client";

import { useLocale } from "next-intl";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { Property, PropertyImage, Location } from "@/types";

interface FeaturedPropertiesProps {
  properties: (Property & { images?: PropertyImage[]; location?: Location })[];
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  const locale = useLocale();
  const { isFavorite, toggleFavorite } = useFavorites();
  const emptyMessage = locale === "al"
    ? "Nuk ka prona te vecanta."
    : locale === "mk"
    ? "Nema istaknati imoti."
    : locale === "de"
    ? "Keine hervorgehobenen Immobilien verfugbar."
    : locale === "tr"
    ? "One cikan ilan bulunamadi."
    : "No featured properties available.";

  if (properties.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorite={isFavorite(property.id)}
          onToggleFavorite={toggleFavorite}
          variant="featured"
        />
      ))}
    </div>
  );
}
