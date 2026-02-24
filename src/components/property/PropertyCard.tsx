"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Heart,
  MapPin,
  Maximize,
  BedDouble,
  Bath,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, getLocalizedField } from "@/lib/utils";
import type { Property, PropertyImage } from "@/types";

interface PropertyCardProps {
  property: Property & { images?: PropertyImage[] };
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
}: PropertyCardProps) {
  const t = useTranslations("property");
  const locale = useLocale();
  const [currentImage, setCurrentImage] = React.useState(0);

  const images = [
    { id: 0, url: "/uploads/placeholder.jpg", alt: "", sort_order: 0, is_primary: true },
    { id: 1, url: "/uploads/property-1.jpg", alt: "", sort_order: 1, is_primary: false },
    { id: 2, url: "/uploads/property-2.jpg", alt: "", sort_order: 2, is_primary: false },
    { id: 3, url: "/uploads/property-3.jpg", alt: "", sort_order: 3, is_primary: false },
  ];

  const title = getLocalizedField(property, "title", locale);

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={images[currentImage]?.url || "/uploads/property-1.jpg"}
          alt={images[currentImage]?.alt || title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentImage((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                );
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentImage((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                );
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    idx === currentImage ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {property.featured && (
            <span className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white">
              {t("featured")}
            </span>
          )}
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold text-white",
              property.type === "sale" ? "bg-amber-500" : "bg-rose-600"
            )}
          >
            {property.type === "sale" ? t("forSale") : t("forRent")}
          </span>
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(property.id);
            }}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-2 shadow transition-colors hover:bg-white"
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600"
              )}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <Link href={`/properties/${property.id}`}>
        <div className="p-4">
          <div className="mb-1 text-lg font-bold text-gray-900">
            {formatPrice(property.price, property.currency)}
            {property.type === "rent" && (
              <span className="text-sm font-normal text-gray-500">/mo</span>
            )}
          </div>
          <h3 className="mb-2 line-clamp-1 text-sm font-semibold text-gray-900">
            {title}
          </h3>
          {property.location && (
            <p className="mb-3 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {getLocalizedField(property.location, "name", locale)}
            </p>
          )}
          <div className="flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              {property.surface_area} m²
            </span>
            {property.rooms && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {property.rooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                {property.bathrooms}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
