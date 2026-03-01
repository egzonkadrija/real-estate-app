"use client";

import { PropertyCard } from "@/components/property/PropertyCard";
import { SkeletonCard } from "@/components/property/SkeletonCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { Property, PropertyImage, Location } from "@/types";

interface PropertiesGridProps {
  properties: (Property & { images?: PropertyImage[]; location?: Location })[];
  loading?: boolean;
  skeletonCount?: number;
}

export function PropertiesGrid({
  properties,
  loading = false,
  skeletonCount = 0,
}: PropertiesGridProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorite={isFavorite(property.id)}
          onToggleFavorite={toggleFavorite}
        />
      ))}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonCard key={`property-skeleton-${index}`} />
        ))}
    </div>
  );
}
