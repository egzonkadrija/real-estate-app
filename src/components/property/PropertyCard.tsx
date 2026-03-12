"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Bath,
  Ruler,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, getLocalizedField, normalizeImageUrl } from "@/lib/utils";
import {
  getFloorLabelKey,
  supportsBathroomsField,
  supportsFloorField,
  supportsRoomsField,
} from "@/lib/propertyFloor";
import type { Property, PropertyImage } from "@/types";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: Property & { images?: PropertyImage[] };
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onMoreInfoToggle?: (isOpen: boolean) => void;
  variant?: "default" | "featured";
}

export function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
  onMoreInfoToggle,
  variant = "default",
}: PropertyCardProps) {
  const t = useTranslations("property");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [currentImage, setCurrentImage] = React.useState(0);
  const [showMoreInfo, setShowMoreInfo] = React.useState(false);
  const isDuplex = React.useMemo(() => {
    const duplexRegex = /\b(?:duplex|dupleks)\b/i;
    return [property.title_al, property.title_en, property.title_de]
      .some((value) => typeof value === "string" && duplexRegex.test(value));
  }, [property.title_al, property.title_en, property.title_de]);

  const mainImage = isDuplex
    ? "/uploads/duplex.jpg"
    : property.category === "land"
    ? "/uploads/land-placeholder.jpg"
    : property.category === "apartment"
    ? "/uploads/apartment-placeholder.jpg"
    : property.category === "office"
    ? "/uploads/office-placeholder.avif"
    : property.category === "store"
    ? "/uploads/store-placeholder.jpg"
    : property.category === "warehouse"
    ? "/uploads/warehouse-placeholder.jpg"
    : property.category === "penthouse"
    ? "/uploads/penthouse-placeholder.webp"
    : "/uploads/placeholder.jpg";

  const fallbackImages = React.useMemo(
    () =>
      isDuplex
        ? [
            { id: 0, url: "/uploads/duplex.jpg", alt: "", sort_order: 0, is_primary: true },
          ]
        : property.category === "warehouse"
        ? [
            { id: 0, url: mainImage, alt: "", sort_order: 0, is_primary: true },
            { id: 1, url: "/uploads/warehouse-interior-1.jpg", alt: "", sort_order: 1, is_primary: false },
            { id: 2, url: "/uploads/warehouse-interior-2.jpg", alt: "", sort_order: 2, is_primary: false },
          ]
        : property.category === "penthouse"
        ? [
            { id: 0, url: mainImage, alt: "", sort_order: 0, is_primary: true },
            { id: 1, url: "/uploads/penthouse-interior-1.jfif", alt: "", sort_order: 1, is_primary: false },
          ]
        : property.category === "apartment"
        ? [
            { id: 0, url: mainImage, alt: "", sort_order: 0, is_primary: true },
            { id: 1, url: "/uploads/apartment-interior-1.jfif", alt: "", sort_order: 1, is_primary: false },
            { id: 2, url: "/uploads/apartment-interior-2.jfif", alt: "", sort_order: 2, is_primary: false },
          ]
        : property.category === "land"
        ? [
            { id: 0, url: mainImage, alt: "", sort_order: 0, is_primary: true },
          ]
        : property.category === "house"
        ? [
            { id: 0, url: mainImage, alt: "", sort_order: 0, is_primary: true },
            { id: 1, url: "/uploads/house-interior-2.jpg", alt: "", sort_order: 1, is_primary: false },
            { id: 2, url: "/uploads/house-interior-3.jpg", alt: "", sort_order: 2, is_primary: false },
            { id: 3, url: "/uploads/house-interior-1.jpg", alt: "", sort_order: 3, is_primary: false },
          ]
        : [
            { id: 0, url: mainImage, alt: "", sort_order: 0, is_primary: true },
            { id: 1, url: "/uploads/property-1.jpg", alt: "", sort_order: 1, is_primary: false },
            { id: 2, url: "/uploads/property-2.jpg", alt: "", sort_order: 2, is_primary: false },
            { id: 3, url: "/uploads/property-3.jpg", alt: "", sort_order: 3, is_primary: false },
          ],
    [isDuplex, mainImage, property.category]
  );
  const images = React.useMemo(() => {
    if (Array.isArray(property.images) && property.images.length > 0) {
      return [...property.images].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.sort_order - b.sort_order;
      });
    }

    return fallbackImages;
  }, [fallbackImages, property.images]);

  const title = getLocalizedField(property, "title", locale);
  const propertyHref = `/properties/${property.id}`;
  const amenities = React.useMemo(
    () => (Array.isArray(property.amenities) ? (property.amenities as string[]) : []),
    [property.amenities]
  );
  const featureItems = React.useMemo(
    () =>
      [
        supportsRoomsField(property.category) && property.rooms !== null
          ? {
              key: "rooms",
              icon: BedDouble,
              label: t("rooms"),
              value: String(property.rooms),
            }
          : null,
        supportsBathroomsField(property.category) && property.bathrooms !== null
          ? {
              key: "bathrooms",
              icon: Bath,
              label: t("bathrooms"),
              value: String(property.bathrooms),
            }
          : null,
        {
          key: "area",
          icon: Ruler,
          label: t("area"),
          value: `${property.surface_area} m²`,
        },
      ].filter((item): item is NonNullable<typeof item> => item !== null),
    [property.bathrooms, property.category, property.rooms, property.surface_area, t]
  );
  const infoTitle = locale === "al"
    ? "Informacione të pronës"
    : locale === "mk"
    ? "Информации за имотот"
    : locale === "de"
    ? "Objektinformationen"
    : locale === "tr"
    ? "Mülk bilgileri"
    : "Property information";
  const typeLabel = locale === "al"
    ? "Lloji"
    : locale === "mk"
    ? "Тип"
    : locale === "de"
    ? "Typ"
    : locale === "tr"
    ? "Tür"
    : "Type";
  const statusLabel = locale === "al"
    ? "Statusi"
    : locale === "mk"
    ? "Статус"
    : locale === "de"
    ? "Status"
    : locale === "tr"
    ? "Durum"
    : "Status";
  const amenitiesLabel = locale === "al"
    ? "Pajisje"
    : locale === "mk"
    ? "Опременост"
    : locale === "de"
    ? "Ausstattung"
    : locale === "tr"
    ? "Özellikler"
    : "Amenities";
  const closeLabel = locale === "al"
    ? "Mbyll"
    : locale === "mk"
    ? "Затвори"
    : locale === "de"
    ? "Schließen"
    : locale === "tr"
    ? "Kapat"
    : "Close";

  const infoItems = React.useMemo(() => {
    const rows: Array<{ label: string; value: string }> = [];
    const locationValue = property.location
      ? getLocalizedField(property.location, "name", locale)
      : "";
    const floorLabelKey = getFloorLabelKey(property.category) === "property.houseFloors"
      ? "houseFloors"
      : "floor";

    rows.push({
      label: t("price"),
      value: `${formatPrice(property.price, property.currency)}${property.type === "rent" ? "/mo" : ""}`,
    });
    rows.push({ label: t("area"), value: `${property.surface_area} m²` });
    rows.push({
      label: typeLabel,
      value: property.type === "sale" ? t("forSale") : t("forRent"),
    });
    rows.push({ label: statusLabel, value: t(`status.${property.status}`) });

    if (locationValue) {
      rows.push({ label: t("location"), value: locationValue });
    }
    if (supportsRoomsField(property.category) && property.rooms !== null) {
      rows.push({ label: t("rooms"), value: String(property.rooms) });
    }
    if (supportsBathroomsField(property.category) && property.bathrooms !== null) {
      rows.push({ label: t("bathrooms"), value: String(property.bathrooms) });
    }
    if (supportsFloorField(property.category) && property.floor !== null) {
      rows.push({ label: t(floorLabelKey), value: String(property.floor) });
    }
    if (property.year_built !== null) {
      rows.push({ label: t("yearBuilt"), value: String(property.year_built) });
    }
    if (amenities.length > 0) {
      rows.push({
        label: amenitiesLabel,
        value: amenities
          .map((amenity) =>
            amenity
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          )
          .slice(0, 4)
          .join(", "),
      });
    }

    return rows.slice(0, 10);
  }, [amenities, amenitiesLabel, locale, property, statusLabel, t, typeLabel]);

  React.useEffect(() => {
    onMoreInfoToggle?.(showMoreInfo);
  }, [onMoreInfoToggle, showMoreInfo]);

  React.useEffect(() => {
    setCurrentImage(0);
  }, [property.id]);

  React.useEffect(() => {
    if (!showMoreInfo) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMoreInfo(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showMoreInfo]);

  React.useEffect(() => {
    if (!showMoreInfo) return;

    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyTouchAction = body.style.touchAction;
    const prevBodyPaddingRight = body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - html.clientWidth;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.touchAction = "none";
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.touchAction = prevBodyTouchAction;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [showMoreInfo]);

  React.useEffect(() => {
    return () => {
      onMoreInfoToggle?.(false);
    };
  }, [onMoreInfoToggle]);

  const imageHeightClass =
    variant === "featured"
      ? "h-[224px] sm:h-[236px] lg:h-[260px]"
      : "h-[188px] sm:h-[208px] lg:h-[240px]";
  const isDefaultCard = variant === "default";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-shadow hover:shadow-md",
        isDefaultCard && "property-card-listing"
      )}
    >
      {/* Image Carousel */}
      <div
        className={cn(
          "relative overflow-hidden bg-gray-100 touch-pan-y",
          imageHeightClass,
          isDefaultCard && "property-card-listing__media"
        )}
      >
        <Link href={propertyHref} aria-label={title} className="block h-full w-full">
          <Image
            src={normalizeImageUrl(images[currentImage]?.url, mainImage)}
            alt={images[currentImage]?.alt || title}
            fill
            draggable={false}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 430px) 92vw, (max-width: 768px) 82vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImage((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  );
                }}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/90 p-1.5 opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImage((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  );
                }}
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/90 p-1.5 opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
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
          <div className="absolute left-2.5 top-2.5 z-10 flex gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
            {property.featured && (
              <span className="rounded-[var(--radius-sm)] bg-teal-700 px-2 py-0.5 text-[10px] font-semibold text-white sm:px-2.5 sm:py-1 sm:text-xs">
                {t("featured")}
              </span>
            )}
            <span
              className={cn(
                "rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-semibold text-white sm:px-2.5 sm:py-1 sm:text-xs",
                property.type === "sale" ? "bg-[var(--brand-600)]" : "bg-gray-700"
              )}
            >
              {property.type === "sale" ? t("forSale") : t("forRent")}
            </span>
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(property.id);
              }}
              className="absolute right-2.5 top-2.5 z-20 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/90 p-1.5 shadow transition-colors hover:bg-white sm:right-3 sm:top-3 sm:p-2"
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
      <div className={cn("flex flex-1 flex-col p-3 sm:p-4", isDefaultCard && "property-card-listing__body")}>
        <Link
          href={propertyHref}
          className={cn(
            "block font-bold leading-tight text-gray-900 hover:underline sm:text-lg",
            isDefaultCard ? "property-card-listing__price text-[15px]" : "text-base"
          )}
        >
          {formatPrice(property.price, property.currency)}
          {property.type === "rent" && (
            <span className="ml-0.5 text-xs font-normal text-gray-500 sm:text-sm">/mo</span>
          )}
        </Link>
        <Link
          href={propertyHref}
          title={title}
          className={cn(
            "mt-1 block text-sm font-semibold leading-tight text-gray-900 hover:underline sm:text-base",
            isDefaultCard ? "property-card-listing__title sm:truncate" : "truncate"
          )}
        >
          {title}
        </Link>
        {property.location && (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-[11px] text-gray-500 sm:text-xs",
              isDefaultCard && "property-card-listing__location"
            )}
          >
            <MapPin className="h-3 w-3 shrink-0 text-blue-600" />
            <span className="truncate">{getLocalizedField(property.location, "name", locale)}</span>
          </p>
        )}
        <div
          className={cn(
            "mt-2 grid grid-cols-3 gap-2 sm:mt-3",
            isDefaultCard && "property-card-listing__features"
          )}
        >
          {featureItems.map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.key}
                title={item.label}
                className={cn(
                  "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1.5 text-[11px] font-medium text-gray-700 sm:text-xs",
                  isDefaultCard && "property-card-listing__feature"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--brand-700)]" />
                <span className="sr-only">{item.label}: </span>
                <span className="truncate">{item.value}</span>
              </span>
            );
          })}
        </div>
        <div className={cn("mt-2 sm:mt-3", isDefaultCard && "property-card-listing__button-wrap")}>
          <Button
            asChild={false}
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMoreInfo((prev) => !prev);
            }}
            className={cn(
              "h-9 w-full rounded-[var(--radius-md)] text-sm",
              isDefaultCard && "property-card-listing__button"
            )}
          >
            <span>{tCommon("viewDetails")}</span>
          </Button>
        </div>
      </div>

      {showMoreInfo && (
        <div
          className="fixed inset-0 z-[100] flex cursor-default touch-none items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setShowMoreInfo(false)}
        >
          <div
            className="w-full max-w-lg cursor-auto rounded-[var(--radius-lg)] bg-white p-4 shadow-2xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{infoTitle}</p>
                <p className="truncate text-xs text-gray-500">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreInfo(false)}
                aria-label={closeLabel}
                className="rounded-[var(--radius-pill)] border border-[var(--border)] p-1.5 text-gray-600 hover:bg-[var(--surface-muted)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-[65vh] space-y-1.5 overflow-y-auto pr-1">
              {infoItems.map((item) => (
                <li
                  key={`${item.label}-${item.value}`}
                  className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-gray-100 px-2 py-2 text-xs"
                >
                  <span className="text-gray-500">{item.label}</span>
                  <span className="text-right font-medium text-gray-800">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}

