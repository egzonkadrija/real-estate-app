"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Locale } from "@/i18n/routing";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, getLocalizedField } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/utils";
import { PROPERTY_CATEGORIES, PROPERTY_TYPES } from "@/lib/constants";

interface PropertyItem {
  id: number;
  title_al: string;
  title_en: string;
  title_de: string;
  type: string;
  category: string;
  price: number;
  currency: string;
  status: string;
  featured: boolean;
  created_at: string;
  images?: { url: string }[];
  location?: { name_al: string; name_en: string; name_de: string };
}

interface PropertyDetail extends PropertyItem {
  description_al?: string;
  description_en?: string;
  description_de?: string;
  surface_area?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  floor?: number | null;
  year_built?: number | null;
  amenities?: string[];
  latitude?: number | null;
  longitude?: number | null;
  agent?: { id: number; name: string } | null;
  images?: { url: string }[];
  location?: {
    name_al?: string;
    name_en?: string;
    name_de?: string;
    name_mk?: string;
    name_tr?: string;
  } | null;
}

export default function AdminPropertiesPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [properties, setProperties] = React.useState<PropertyItem[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<"all" | "sale" | "rent">("all");
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const loadMoreSentinelRef = React.useRef<HTMLDivElement | null>(null);
  const previewRequestRef = React.useRef(0);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [markingAsSoldId, setMarkingAsSoldId] = React.useState<number | null>(null);
  const [relistingId, setRelistingId] = React.useState<number | null>(null);
  const [previewProperty, setPreviewProperty] = React.useState<PropertyDetail | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewImageIndex, setPreviewImageIndex] = React.useState(0);

  const hasMore = properties.length < total;
  const hasData = properties.length > 0;

  const handleTypeFilterChange = React.useCallback((nextType: "all" | "sale" | "rent") => {
    setTypeFilter(nextType);
    setPage(1);
    setProperties([]);
    setTotal(0);
  }, []);

  

  const fetchProperties = React.useCallback(
    async (targetPage = 1, reset = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          limit: "10",
        });
        if (typeFilter !== "all") {
          params.set("type", typeFilter);
        }

        const res = await fetch(`/api/properties?${params.toString()}`);
        const data = await res.json();
        const nextItems = Array.isArray(data.data) ? data.data : [];
        const nextTotal =
          typeof data.total === "number" ? data.total : nextItems.length;

        setTotal(nextTotal);
        setProperties((previous) => {
          if (reset) return nextItems;
          const seen = new Set(previous.map((property) => property.id));
          const unique = nextItems.filter((property) => !seen.has(property.id));
          return [...previous, ...unique];
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [typeFilter]
  );

  React.useEffect(() => {
    fetchProperties(page, page === 1);
  }, [fetchProperties, page]);

  React.useEffect(() => {
    if (!loadMoreSentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const shouldLoadMore = entries[0]?.isIntersecting && !loading && hasMore;
        if (shouldLoadMore) {
          setPage((previous) => previous + 1);
        }
      },
      {
        root: null,
        rootMargin: "240px",
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreSentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading]);

  const onResetList = React.useCallback(() => {
    setPage(1);
    setProperties([]);
    setTotal(0);
    fetchProperties(1, true);
  }, [fetchProperties]);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await fetch(`/api/properties/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      setProperties((previous) => {
        const next = previous.filter((property) => property.id !== id);
        return next;
      });
      setTotal((previous) => Math.max(0, previous - 1));
    } catch (e) {
      console.error(e);
    }
  }

  function getCompletionStatus(property: PropertyItem): "sold" | "rented" {
    return property.type === "rent" ? "rented" : "sold";
  }

  function getCompletionLabel(property: PropertyItem): "Sold" | "Rented" {
    return property.type === "rent" ? "Rented" : "Sold";
  }

  async function handleMarkCompleted(property: PropertyItem) {
    const nextStatus = getCompletionStatus(property);
    const nextLabel = getCompletionLabel(property);
    if (!confirm(`Mark this property as ${nextLabel.toLowerCase()}?`)) return;
    setMarkingAsSoldId(property.id);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Failed to mark property as ${nextLabel.toLowerCase()}`);
      }
      setProperties((previous) =>
        previous.map((item) =>
          item.id === property.id ? { ...item, status: nextStatus } : item
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAsSoldId(null);
    }
  }

  async function handleRelist(property: PropertyItem) {
    if (!confirm("Mark this property as active again so it appears on homepage listings?")) return;
    setRelistingId(property.id);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to relist property");
      }
      setProperties((previous) =>
        previous.map((item) =>
          item.id === property.id ? { ...item, status: "active" } : item
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setRelistingId(null);
    }
  }

  React.useEffect(() => {
    if (properties.length > total && total > 0) {
      setProperties((previous) => previous.slice(0, total));
    }
  }, [properties.length, total]);

  const closePreview = React.useCallback(() => {
    previewRequestRef.current += 1;
    setPreviewProperty(null);
    setPreviewLoading(false);
    setPreviewImageIndex(0);
  }, []);

  React.useEffect(() => {
    if (!previewProperty) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePreview, previewProperty]);

  const saleProperties = React.useMemo(
    () => properties.filter((property) => property.type === "sale"),
    [properties]
  );
  const rentProperties = React.useMemo(
    () => properties.filter((property) => property.type === "rent"),
    [properties]
  );

  async function openPreview(propertyId: number) {
    const requestId = previewRequestRef.current + 1;
    previewRequestRef.current = requestId;
    setPreviewLoading(true);
    setPreviewImageIndex(0);
    try {
      const res = await fetch(`/api/properties/${propertyId}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load property preview");
      }
      if (previewRequestRef.current !== requestId) return;
      setPreviewProperty(data as PropertyDetail);
    } catch (error) {
      console.error(error);
    } finally {
      if (previewRequestRef.current !== requestId) return;
      setPreviewLoading(false);
    }
  }

  function renderPropertyRow(prop: PropertyItem) {
    return (
      <tr
        key={prop.id}
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => void openPreview(prop.id)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 overflow-hidden rounded bg-gray-100">
              {prop.images?.[0] && (
                <Image
                  src={normalizeImageUrl(prop.images[0].url)}
                  alt=""
                  width={56}
                  height={40}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {getLocalizedField(prop, "title", locale)}
              </p>
              {prop.location && (
                <p className="text-xs text-gray-500">
                  {getLocalizedField(prop.location, "name", locale)}
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              prop.type === "sale"
                ? "bg-blue-50 text-blue-700"
                : "bg-emerald-50 text-emerald-700"
            )}
          >
            {prop.type}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-900">
          {formatPrice(prop.price, prop.currency)}
        </td>
        <td className="px-4 py-3">
          <span
            className={cn("rounded-full px-2 py-0.5 text-xs font-medium", {
              "bg-green-50 text-green-700": prop.status === "active",
              "bg-yellow-50 text-yellow-700": prop.status === "pending",
              "bg-gray-100 text-gray-700":
                prop.status === "sold" || prop.status === "rented",
            })}
          >
            {prop.status}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">
          {new Date(prop.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setEditingId(prop.id);
                setShowForm(true);
              }}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void handleDelete(prop.id);
              }}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            {prop.status !== getCompletionStatus(prop) ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleMarkCompleted(prop);
                }}
                disabled={markingAsSoldId === prop.id}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-60"
              >
                {markingAsSoldId === prop.id ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {getCompletionLabel(prop)}
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{getCompletionLabel(prop)}</span>
                  </>
                )}
              </button>
            ) : null}
            {prop.status === "rented" || prop.status === "sold" ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleRelist(prop);
                }}
                disabled={relistingId === prop.id}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-60"
              >
                {relistingId === prop.id ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Relisting...
                  </span>
                ) : (
                  <span>Relist</span>
                )}
              </button>
            ) : null}
          </div>
        </td>
      </tr>
    );
  }

  function renderTypeDivider(label: string) {
    return (
      <tr key={`divider-${label}`} className="bg-red-50">
        <td
          colSpan={6}
          className="border-y-2 border-red-400 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-700"
        >
          {label}
        </td>
      </tr>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("admin.properties")}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => handleTypeFilterChange("all")}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors",
                typeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {t("common.all")}
            </button>
            <button
              type="button"
              onClick={() => handleTypeFilterChange("sale")}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors",
                typeFilter === "sale"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {t("property.forSale")}
            </button>
            <button
              type="button"
              onClick={() => handleTypeFilterChange("rent")}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors",
                typeFilter === "rent"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {t("property.forRent")}
            </button>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t("admin.addProperty")}
          </button>
        </div>
      </div>
      {/* Properties Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && properties.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No properties found
                  </td>
                </tr>
              ) : (
                <>
                  {typeFilter === "all" ? (
                    <>
                      {saleProperties.length > 0 ? renderTypeDivider("For Sale") : null}
                      {saleProperties.map((prop) => renderPropertyRow(prop))}
                      {saleProperties.length > 0 && rentProperties.length > 0
                        ? renderTypeDivider("For Rent")
                        : null}
                      {saleProperties.length === 0 && rentProperties.length > 0
                        ? renderTypeDivider("For Rent")
                        : null}
                      {rentProperties.map((prop) => renderPropertyRow(prop))}
                    </>
                  ) : (
                    properties.map((prop) => renderPropertyRow(prop))
                  )}
                  {loading && properties.length > 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 animate-pulse rounded bg-gray-200" />
                      </td>
                    </tr>
                  ) : null}
                </>
              )}
            </tbody>
          </table>
        </div>
        {hasData && hasMore ? (
          <div
            ref={loadMoreSentinelRef}
            className="border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-500"
          >
            Load more as you scroll
          </div>
        ) : null}

        {hasData && !loading && !hasMore ? (
          <div className="border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-500">
            No more properties.
          </div>
        ) : null}
      </div>

      {(previewProperty || previewLoading) && (
        <PropertyPreviewModal
          locale={locale}
          property={previewProperty}
          loading={previewLoading}
          imageIndex={previewImageIndex}
          onImageChange={setPreviewImageIndex}
          onClose={closePreview}
        />
      )}

      {/* Add/Edit Property Modal */}
      {showForm && (
        <PropertyFormModal
          editingId={editingId}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditingId(null);
            onResetList();
          }}
        />
      )}
    </div>
  );
}

function PropertyPreviewModal({
  locale,
  property,
  loading,
  imageIndex,
  onImageChange,
  onClose,
}: {
  locale: Locale;
  property: PropertyDetail | null;
  loading: boolean;
  imageIndex: number;
  onImageChange: (index: number) => void;
  onClose: () => void;
}) {
  const description = getLocalizedField(property, "description", locale);
  const title = property ? getLocalizedField(property, "title", locale) : "";
  const location = property?.location
    ? getLocalizedField(property.location, "name", locale)
    : "";
  const selectedImage = property?.images?.[imageIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {loading ? "Loading property..." : title}
            </h2>
            {!loading && location ? (
              <p className="mt-1 text-sm text-gray-500">{location}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
            <div className="space-y-3">
              <div className="h-8 animate-pulse rounded bg-gray-100" />
              <div className="h-24 animate-pulse rounded bg-gray-100" />
              <div className="h-24 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ) : property ? (
          <div className="grid max-h-[78vh] gap-6 overflow-y-auto p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="relative h-80 overflow-hidden rounded-2xl bg-gray-100">
                {selectedImage ? (
                  <Image
                    src={normalizeImageUrl(selectedImage.url)}
                    alt={title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No images available
                  </div>
                )}
              </div>

              {property.images && property.images.length > 1 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {property.images.map((image, index) => (
                    <button
                      key={`${image.url}-${index}`}
                      type="button"
                      onClick={() => onImageChange(index)}
                      className={cn(
                        "relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-gray-100",
                        imageIndex === index ? "border-blue-500" : "border-transparent"
                      )}
                    >
                      <Image
                        src={normalizeImageUrl(image.url)}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(property.price, property.currency)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      property.type === "sale"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {property.type}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                      {
                        "bg-green-50 text-green-700": property.status === "active",
                        "bg-yellow-50 text-yellow-700": property.status === "pending",
                        "bg-gray-100 text-gray-700":
                          property.status === "sold" || property.status === "rented",
                      }
                    )}
                  >
                    {property.status}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {property.category}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Details
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <p className="text-xs text-gray-500">Area</p>
                    <p>{property.surface_area ?? "-"} m2</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rooms</p>
                    <p>{property.rooms ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bathrooms</p>
                    <p>{property.bathrooms ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Floor</p>
                    <p>{property.floor ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Year built</p>
                    <p>{property.year_built ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Agent</p>
                    <p>{property.agent?.name ?? "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                  {description || "No description provided."}
                </p>
              </div>

              {property.amenities && property.amenities.length > 0 ? (
                <div className="rounded-2xl border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Amenities
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PropertyFormModal({
  editingId,
  onClose,
  onSaved,
}: {
  editingId: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations();
  const [loading, setLoading] = React.useState(false);
  const [locations, setLocations] = React.useState<{ id: number; name_al: string; name_en: string; name_de: string; type: string }[]>([]);
  const [agents, setAgents] = React.useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = React.useState({
    title_al: "",
    title_en: "",
    title_de: "",
    description_al: "",
    description_en: "",
    description_de: "",
    type: "sale",
    category: "apartment",
    price: "",
    currency: "EUR",
    surface_area: "",
    rooms: "",
    bathrooms: "",
    floor: "",
    year_built: "",
    location_id: "",
    agent_id: "",
    featured: false,
    status: "active",
    amenities: [] as string[],
    latitude: "",
    longitude: "",
  });
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([]);

  

  React.useEffect(() => {
    fetch("/api/locations").then((r) => r.json()).then(setLocations).catch(() => {});
    fetch("/api/agents").then((r) => r.json()).then((d) => setAgents(Array.isArray(d) ? d : d.data || [])).catch(() => {});

    if (editingId) {
      fetch(`/api/properties/${editingId}`)
        .then((r) => r.json())
        .then((prop) => {
          setFormData({
            title_al: prop.title_al || "",
            title_en: prop.title_en || "",
            title_de: prop.title_de || "",
            description_al: prop.description_al || "",
            description_en: prop.description_en || "",
            description_de: prop.description_de || "",
            type: prop.type || "sale",
            category: prop.category || "apartment",
            price: String(prop.price || ""),
            currency: prop.currency || "EUR",
            surface_area: String(prop.surface_area || ""),
            rooms: String(prop.rooms || ""),
            bathrooms: String(prop.bathrooms || ""),
            floor: String(prop.floor || ""),
            year_built: String(prop.year_built || ""),
            location_id: String(prop.location_id || ""),
            agent_id: String(prop.agent_id || ""),
            featured: prop.featured || false,
            status: prop.status || "active",
            amenities: prop.amenities || [],
            latitude: String(prop.latitude || ""),
            longitude: String(prop.longitude || ""),
          });
          if (prop.images) {
            setUploadedImages(prop.images.map((img: { url: string }) => img.url));
          }
        })
        .catch(() => {});
    }
  }, [editingId]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (data.url) {
          setUploadedImages((prev) => [...prev, data.url]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      ...formData,
      price: Number(formData.price),
      surface_area: Number(formData.surface_area),
      rooms: formData.rooms ? Number(formData.rooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      floor: formData.floor ? Number(formData.floor) : null,
      year_built: formData.year_built ? Number(formData.year_built) : null,
      location_id: Number(formData.location_id),
      agent_id: Number(formData.agent_id),
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      images: uploadedImages.map((url, i) => ({
        url,
        sort_order: i,
        is_primary: i === 0,
      })),
    };

    try {
      const url = editingId ? `/api/properties/${editingId}` : "/api/properties";
      const method = editingId ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const cities = locations.filter((l) => l.type === "city");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">
            {editingId ? t("admin.editProperty") : t("admin.addProperty")}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Titles */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">Title (Albanian)</label>
              <input value={formData.title_al} onChange={(e) => setFormData({ ...formData, title_al: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Title (English)</label>
              <input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Title (German)</label>
              <input value={formData.title_de} onChange={(e) => setFormData({ ...formData, title_de: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            {/* Descriptions */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">Description (Albanian)</label>
              <textarea value={formData.description_al} onChange={(e) => setFormData({ ...formData, description_al: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Description (English)</label>
              <textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Description (German)</label>
              <textarea value={formData.description_de} onChange={(e) => setFormData({ ...formData, description_de: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            {/* Type & Category */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                {PROPERTY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Numeric fields */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Price (EUR)</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Area (m²)</label>
              <input type="number" value={formData.surface_area} onChange={(e) => setFormData({ ...formData, surface_area: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Rooms</label>
              <input type="number" value={formData.rooms} onChange={(e) => setFormData({ ...formData, rooms: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Bathrooms</label>
              <input type="number" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Floor</label>
              <input type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Year Built</label>
              <input type="number" value={formData.year_built} onChange={(e) => setFormData({ ...formData, year_built: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            {/* Location & Agent */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Location</label>
              <select value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Select...</option>
                {cities.map((l) => <option key={l.id} value={l.id}>{l.name_en}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Agent</label>
              <select value={formData.agent_id} onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Select...</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            {/* Coordinates */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Latitude</label>
              <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Longitude</label>
              <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            {/* Status & Featured */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                Featured Property
              </label>
            </div>
            {/* Images */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">Images</label>
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((url, i) => (
                  <div key={i} className="relative h-20 w-24 overflow-hidden rounded-lg border">
                    <Image
                      src={normalizeImageUrl(url)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-20 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
