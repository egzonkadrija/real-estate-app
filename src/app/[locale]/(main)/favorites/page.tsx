"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useFavorites } from "@/hooks/useFavorites";
import { PropertyCard } from "@/components/property/PropertyCard";
import { SkeletonCard } from "@/components/property/SkeletonCard";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import type { Property, PropertyImage, Location } from "@/types";

type PropertyWithRelations = Property & {
  images?: PropertyImage[];
  location?: Location;
};

export default function FavoritesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [properties, setProperties] = useState<PropertyWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      if (favorites.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/properties?ids=${favorites.join(",")}`
        );
        if (res.ok) {
          const data = await res.json();
          setProperties(data.data || data);
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [favorites]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        {t("common.favorites")}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : properties.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-700">
            {t("common.noResults")}
          </h2>
          <p className="mb-6 text-gray-500">
            Save properties by clicking the heart icon.
          </p>
          <Button asChild>
            <Link href="/properties">{t("common.properties")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
