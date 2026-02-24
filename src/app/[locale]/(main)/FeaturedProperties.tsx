"use client";

import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { Property, PropertyImage, Location } from "@/types";

interface FeaturedPropertiesProps {
  properties: (Property & { images?: PropertyImage[]; location?: Location })[];
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (properties.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No featured properties available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorite={isFavorite(property.id)}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
}
