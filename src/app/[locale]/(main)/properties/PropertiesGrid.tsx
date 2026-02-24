"use client";

import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { Property, PropertyImage, Location } from "@/types";

interface PropertiesGridProps {
  properties: (Property & { images?: PropertyImage[]; location?: Location })[];
}

export function PropertiesGrid({ properties }: PropertiesGridProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
