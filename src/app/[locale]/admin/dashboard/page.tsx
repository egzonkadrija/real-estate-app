"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, Locale } from "@/i18n/routing";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  DollarSign,
  ExternalLink,
  ListChecks,
  MailOpen,
  X,
} from "lucide-react";
import { cn, getLocalizedField } from "@/lib/utils";
import {
  getReviewSource,
  parseReviewPayload,
  parseReviewStatus,
} from "@/lib/propertyRequestReview";

interface PropertyRequest {
  id: number;
  type: "buy" | "rent";
  category: string;
  location: string | null;
  name: string;
  email: string;
  description: string | null;
  review_status: "pending" | "approved" | "declined";
  created_at: string;
}

interface PropertyPreview {
  id: number;
  title_al: string;
  title_en: string;
  title_de: string;
  status: string;
  type: string;
  category: string;
  created_at: string;
  location?: {
    name_al?: string;
    name_en?: string;
    name_de?: string;
    name_mk?: string;
    name_tr?: string;
  } | null;
}

interface PropertyListResponse {
  data: PropertyPreview[];
  total: number;
}

interface AdminHQStats {
  pendingRequests: number;
  pendingProperties: number;
  activeListings: number;
  soldProperties: number;
  rentedProperties: number;
  requestedProperties: number;
}

interface MonthlyRevenue {
  month: string;
  monthLabel: string;
  apartment: number;
  office: number;
  total: number;
}

interface SoldPropertyForAdmin {
  id: number;
  title: string;
  category: string;
  type: string;
  price: number;
}

interface RevenueSnapshot {
  soldRevenue: number;
  soldProperties: SoldPropertyForAdmin[];
  monthlyRentedRevenue: MonthlyRevenue[];
}

type DashboardCardId =
  | "pendingRequests"
  | "pendingProperties"
  | "activeListings"
  | "soldProperties"
  | "rentedProperties"
  | "requestedProperties";

type PropertyBucket = "pending" | "active" | "sold" | "rented";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getRequestTitle(request: PropertyRequest) {
  const payload = parseReviewPayload(request.description);
  return payload?.property?.title?.trim() || `${request.category} request`;
}

function getRequestMeta(request: PropertyRequest) {
  const payload = parseReviewPayload(request.description);
  const details = [
    request.location,
    payload?.property?.location_name,
    payload?.property?.price ? `${payload.property.price} EUR` : null,
  ].filter(Boolean);

  return details.join(" • ");
}

function getPropertyStatusTone(status: string) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  if (status === "sold") return "bg-blue-50 text-blue-700";
  if (status === "rented") return "bg-violet-50 text-violet-700";
  return "bg-gray-100 text-gray-700";
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [stats, setStats] = React.useState<AdminHQStats>({
    pendingRequests: 0,
    pendingProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    rentedProperties: 0,
    requestedProperties: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [activeCardId, setActiveCardId] = React.useState<DashboardCardId | null>(null);
  const [pendingRequests, setPendingRequests] = React.useState<PropertyRequest[]>([]);
  const [propertyBuckets, setPropertyBuckets] = React.useState<
    Record<PropertyBucket, PropertyPreview[]>
  >({
    pending: [],
    active: [],
    sold: [],
    rented: [],
  });
  const [requestedProperties, setRequestedProperties] = React.useState<PropertyRequest[]>(
    []
  );
  const [revenue, setRevenue] = React.useState<RevenueSnapshot>({
    soldRevenue: 0,
    soldProperties: [],
    monthlyRentedRevenue: [],
  });

  React.useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [
          submittedRequestsRes,
          requestedPropertiesRes,
          pendingPropertiesRes,
          activePropertiesRes,
          soldPropertiesRes,
          rentedPropertiesRes,
          revenueRes,
        ] = await Promise.all([
          fetch("/api/property-requests?source=submit_property"),
          fetch("/api/property-requests?source=request_property"),
          fetch("/api/properties?status=pending&limit=5"),
          fetch("/api/properties?status=active&limit=5"),
          fetch("/api/properties?status=sold&limit=5"),
          fetch("/api/properties?status=rented&limit=5"),
          fetch("/api/dashboard/revenue"),
        ]);

        const submittedRequestsJson = await submittedRequestsRes.json().catch(() => []);
        const requestedPropertiesJson = await requestedPropertiesRes.json().catch(() => []);
        const pendingPropertiesJson: PropertyListResponse =
          await pendingPropertiesRes.json().catch(() => ({ data: [], total: 0 }));
        const activePropertiesJson: PropertyListResponse =
          await activePropertiesRes.json().catch(() => ({ data: [], total: 0 }));
        const soldPropertiesJson: PropertyListResponse =
          await soldPropertiesRes.json().catch(() => ({ data: [], total: 0 }));
        const rentedPropertiesJson: PropertyListResponse =
          await rentedPropertiesRes.json().catch(() => ({ data: [], total: 0 }));
        const revenueJson = await revenueRes.json().catch(() => ({
          soldRevenue: 0,
          soldProperties: [],
          monthlyRentedRevenue: [],
        }));

        const requestItems = Array.isArray(submittedRequestsJson)
          ? (submittedRequestsJson as PropertyRequest[])
          : [];
        const requestPropertyItems = Array.isArray(requestedPropertiesJson)
          ? (requestedPropertiesJson as PropertyRequest[])
          : [];
        const pendingSubmittedRequests = requestItems.filter((request) => {
          if (parseReviewStatus(request.review_status) !== "pending") {
            return false;
          }
          return getReviewSource(request.description) === "submit_property";
        });

        if (!isMounted) return;

        setStats({
          pendingRequests: pendingSubmittedRequests.length,
          pendingProperties:
            typeof pendingPropertiesJson.total === "number"
              ? pendingPropertiesJson.total
              : pendingPropertiesJson.data.length,
          activeListings:
            typeof activePropertiesJson.total === "number"
              ? activePropertiesJson.total
              : activePropertiesJson.data.length,
          soldProperties:
            typeof soldPropertiesJson.total === "number"
              ? soldPropertiesJson.total
              : soldPropertiesJson.data.length,
          rentedProperties:
            typeof rentedPropertiesJson.total === "number"
              ? rentedPropertiesJson.total
              : rentedPropertiesJson.data.length,
          requestedProperties: requestPropertyItems.length,
        });
        setPendingRequests(pendingSubmittedRequests.slice(0, 5));
        setPropertyBuckets({
          pending: Array.isArray(pendingPropertiesJson.data)
            ? pendingPropertiesJson.data
            : [],
          active: Array.isArray(activePropertiesJson.data)
            ? activePropertiesJson.data
            : [],
          sold: Array.isArray(soldPropertiesJson.data) ? soldPropertiesJson.data : [],
          rented: Array.isArray(rentedPropertiesJson.data)
            ? rentedPropertiesJson.data
            : [],
        });
        setRequestedProperties(requestPropertyItems.slice(0, 5));
        setRevenue({
          soldRevenue:
            typeof revenueJson.soldRevenue === "number" ? revenueJson.soldRevenue : 0,
          soldProperties: Array.isArray(revenueJson.soldProperties)
            ? revenueJson.soldProperties
            : [],
          monthlyRentedRevenue: Array.isArray(revenueJson.monthlyRentedRevenue)
            ? revenueJson.monthlyRentedRevenue
            : [],
        });
      } catch (error) {
        console.error("Failed to fetch admin HQ data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!activeCardId) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveCardId(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCardId]);

  const cardItems = [
    {
      id: "pendingRequests" as const,
      label: "Pending Requests",
      value: loading ? "..." : stats.pendingRequests,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
      hint: "Unreviewed submitted properties",
      panelTitle: "Pending submitted properties",
      panelDescription: "Only requests still waiting for admin review.",
      fullPageHref: "/admin/requests?requestStage=pending" as const,
    },
    {
      id: "pendingProperties" as const,
      label: "Pending Properties",
      value: loading ? "..." : stats.pendingProperties,
      icon: ListChecks,
      tone: "bg-yellow-50 text-yellow-700",
      hint: "Listings waiting for status action",
      panelTitle: "Pending properties",
      panelDescription: "Properties not yet approved for public visibility.",
      fullPageHref: "/admin/properties?propertyStatus=pending" as const,
    },
    {
      id: "activeListings" as const,
      label: "Active Listings",
      value: loading ? "..." : stats.activeListings,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
      hint: "Live properties for public view",
      panelTitle: "Active listings",
      panelDescription: "Properties currently visible on the site.",
      fullPageHref: "/admin/properties?propertyStatus=active" as const,
    },
    {
      id: "soldProperties" as const,
      label: "Sold",
      value: loading ? "..." : stats.soldProperties,
      icon: Building2,
      tone: "bg-blue-50 text-blue-700",
      hint: "Completed property sales",
      panelTitle: "Sold properties",
      panelDescription: "Properties marked as sold.",
      fullPageHref: "/admin/properties?propertyStatus=sold" as const,
    },
    {
      id: "rentedProperties" as const,
      label: "Rented",
      value: loading ? "..." : stats.rentedProperties,
      icon: DollarSign,
      tone: "bg-violet-50 text-violet-700",
      hint: "Current and past rental deals",
      panelTitle: "Rented properties",
      panelDescription: "Properties closed as rentals.",
      fullPageHref: "/admin/properties?propertyStatus=rented" as const,
    },
    {
      id: "requestedProperties" as const,
      label: "Requested Properties",
      value: loading ? "..." : stats.requestedProperties,
      icon: MailOpen,
      tone: "bg-cyan-50 text-cyan-700",
      hint: "Clients looking for a matching property",
      panelTitle: "Requested properties",
      panelDescription: "Recent client property requests from the public form.",
      fullPageHref: "/admin/contacts" as const,
    },
  ];

  const activeCard = cardItems.find((card) => card.id === activeCardId) ?? null;
  const totalMonthlyRentalRevenue = revenue.monthlyRentedRevenue.reduce(
    (sum, row) => sum + row.total,
    0
  );

  function toggleCard(cardId: DashboardCardId) {
    setActiveCardId((current) => (current === cardId ? null : cardId));
  }

  function renderPropertyList(bucket: PropertyBucket) {
    const items = propertyBuckets[bucket];

    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`${bucket}-skeleton-${index}`}
          className="h-16 animate-pulse rounded-xl bg-gray-100"
        />
      ));
    }

    if (items.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
          No matching properties right now.
        </div>
      );
    }

    return items.map((property) => {
      const title = getLocalizedField(property, "title", locale) || "Untitled property";
      const location = getLocalizedField(property.location, "name", locale) || "No location";

      return (
        <div
          key={`${bucket}-${property.id}`}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
              <p className="mt-1 text-xs text-gray-500">
                {location} • {property.category} • {property.type}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
                getPropertyStatusTone(property.status)
              )}
            >
              {property.status}
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Added {new Date(property.created_at).toLocaleDateString()}
          </p>
        </div>
      );
    });
  }

  function renderPendingRequests() {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`request-skeleton-${index}`}
          className="h-16 animate-pulse rounded-xl bg-gray-100"
        />
      ));
    }

    if (pendingRequests.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
          No pending submitted properties right now.
        </div>
      );
    }

    return pendingRequests.map((request) => (
      <div
        key={request.id}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {getRequestTitle(request)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {request.name} • {request.email}
            </p>
            {getRequestMeta(request) ? (
              <p className="mt-2 text-xs text-gray-500">{getRequestMeta(request)}</p>
            ) : null}
          </div>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            Pending
          </span>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Sent {new Date(request.created_at).toLocaleDateString()}
        </p>
      </div>
    ));
  }

  function renderRequestedProperties() {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`requested-property-skeleton-${index}`}
          className="h-16 animate-pulse rounded-xl bg-gray-100"
        />
      ));
    }

    if (requestedProperties.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
          No requested properties right now.
        </div>
      );
    }

    return requestedProperties.map((request) => (
      <div
        key={request.id}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{request.name}</p>
            <p className="mt-1 text-xs text-gray-500">
              {request.category} • {request.type} • {request.location || "No location"}
            </p>
          </div>
          <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-700">
            Request
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-600">{request.email}</p>
        <p className="mt-3 text-xs text-gray-400">
          Received {new Date(request.created_at).toLocaleDateString()}
        </p>
      </div>
    ));
  }

  function renderActivePanel() {
    if (!activeCardId) return null;
    if (activeCardId === "pendingRequests") return renderPendingRequests();
    if (activeCardId === "pendingProperties") return renderPropertyList("pending");
    if (activeCardId === "activeListings") return renderPropertyList("active");
    if (activeCardId === "soldProperties") return renderPropertyList("sold");
    if (activeCardId === "rentedProperties") return renderPropertyList("rented");
    return renderRequestedProperties();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin HQ</h1>
      <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        {t("dashboard")}
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-gray-500">Revenue snapshot</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {loading ? "..." : formatCurrency(revenue.soldRevenue)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Total sold revenue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <p className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
            {loading
              ? "Loading rental revenue..."
              : `${formatCurrency(totalMonthlyRentalRevenue)} total from rentals`}
          </p>
          <p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            {loading
              ? "Loading sold list..."
              : `${revenue.soldProperties.length} sold properties tracked`}
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {revenue.monthlyRentedRevenue.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-xs text-gray-500"
                    colSpan={1}
                  >
                    No rental revenue data yet.
                  </td>
                </tr>
              ) : (
                revenue.monthlyRentedRevenue.map((row) => (
                  <tr key={row.month} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-700">
                      {formatCurrency(row.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {cardItems.map((card) => {
          const isActive = activeCardId === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => toggleCard(card.id)}
              className={cn(
                "cursor-pointer rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md",
                isActive && "border-blue-300 ring-2 ring-blue-100"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <span className={`rounded-lg p-2 ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">{card.hint}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                  {isActive ? "Hide" : "Show"}
                  {isActive ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {activeCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
          onClick={() => setActiveCardId(null)}
        >
          <section
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Dashboard Focus
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {activeCard.panelTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {activeCard.panelDescription}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={activeCard.fullPageHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-100"
                >
                  Open full page
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveCardId(null)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-100"
                >
                  Close
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {renderActivePanel()}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
