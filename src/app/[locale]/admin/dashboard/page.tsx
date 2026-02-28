"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Building2,
  CheckCircle2,
  Clock3,
  DollarSign,
  ListChecks,
  MailOpen,
} from "lucide-react";

interface PropertyRequest {
  id: number;
  review_status: "pending" | "approved" | "declined";
  description: string | null;
}

interface ContactRecord {
  is_read: boolean;
}

interface PropertyListResponse {
  data: unknown[];
  total: number;
}

interface AdminHQStats {
  pendingRequests: number;
  pendingProperties: number;
  activeListings: number;
  soldProperties: number;
  rentedProperties: number;
  supportRequests: number;
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

function parseRequestReviewStatus(
  request: PropertyRequest,
  fallback: "pending" | "approved" | "declined" = "pending"
): "pending" | "approved" | "declined" {
  if (request.review_status) {
    if (
      request.review_status === "approved" ||
      request.review_status === "declined" ||
      request.review_status === "pending"
    ) {
      return request.review_status;
    }
  }

  return fallback;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [stats, setStats] = React.useState<AdminHQStats>({
    pendingRequests: 0,
    pendingProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    rentedProperties: 0,
    supportRequests: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [revenue, setRevenue] = React.useState<RevenueSnapshot>({
    soldRevenue: 0,
    soldProperties: [],
    monthlyRentedRevenue: [],
  });

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
  });

  React.useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [
          requestsRes,
          pendingPropertiesRes,
          activePropertiesRes,
          soldPropertiesRes,
          rentedPropertiesRes,
          contactsRes,
          revenueRes,
        ] = await Promise.all([
          fetch("/api/property-requests", {
            headers: getAuthHeaders(),
          }),
          fetch("/api/properties?status=pending&limit=1"),
          fetch("/api/properties?status=active&limit=1"),
          fetch("/api/properties?status=sold&limit=1"),
          fetch("/api/properties?status=rented&limit=1"),
          fetch("/api/contacts?is_read=false"),
          fetch("/api/dashboard/revenue", { headers: getAuthHeaders() }),
        ]);

        const requestsJson = await requestsRes.json();
        const pendingPropertiesJson: PropertyListResponse =
          await pendingPropertiesRes.json().catch(() => ({ data: [], total: 0 }));
        const activePropertiesJson: PropertyListResponse =
          await activePropertiesRes.json().catch(() => ({ data: [], total: 0 }));
        const soldPropertiesJson: PropertyListResponse =
          await soldPropertiesRes.json().catch(() => ({ data: [], total: 0 }));
        const rentedPropertiesJson: PropertyListResponse =
          await rentedPropertiesRes.json().catch(() => ({ data: [], total: 0 }));
        const contactsJson = await contactsRes.json().catch(() => []);
        const revenueJson = await revenueRes.json().catch(() => ({
          soldRevenue: 0,
          soldProperties: [],
          monthlyRentedRevenue: [],
        }));

        const requests = Array.isArray(requestsJson) ? requestsJson : requestsJson?.data || [];
        const contacts = Array.isArray(contactsJson)
          ? contactsJson
          : contactsJson?.data || [];

        const parsedRequests = Array.isArray(requests)
          ? (requests as PropertyRequest[])
          : [];

        const pendingRequests = parsedRequests.filter((request) => {
          const status = parseRequestReviewStatus(request);
          return status === "pending";
        }).length;

        const supportRequests = (contacts as ContactRecord[]).filter(
          (contact) => !contact.is_read
        ).length;

        const soldProperties = Array.isArray(revenueJson?.soldProperties)
          ? revenueJson.soldProperties
          : [];
        const monthlyRentedRevenue = Array.isArray(revenueJson?.monthlyRentedRevenue)
          ? revenueJson.monthlyRentedRevenue
          : [];

        if (!isMounted) return;
        setStats({
          pendingRequests,
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
          supportRequests,
        });
        setRevenue({
          soldRevenue:
            typeof revenueJson.soldRevenue === "number" ? revenueJson.soldRevenue : 0,
          soldProperties: Array.isArray(soldProperties)
            ? soldProperties.map((property) => ({
                id: property.id,
                title: property.title,
                category: property.category,
                type: property.type,
                price: typeof property.price === "number" ? property.price : 0,
              }))
            : [],
          monthlyRentedRevenue,
        });
      } catch (error) {
        console.error("Failed to fetch admin HQ data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const cardItems = [
    {
      label: "Pending Requests",
      value: loading ? "..." : stats.pendingRequests,
      icon: Clock3,
      href: "/admin/requests?requestStage=pending",
      tone: "bg-amber-50 text-amber-700",
      hint: "Unreviewed customer requests",
    },
    {
      label: "Pending Properties",
      value: loading ? "..." : stats.pendingProperties,
      icon: ListChecks,
      href: "/admin/properties?propertyStatus=pending",
      tone: "bg-yellow-50 text-yellow-700",
      hint: "Listings waiting for status action",
    },
    {
      label: "Active Listings",
      value: loading ? "..." : stats.activeListings,
      icon: CheckCircle2,
      href: "/admin/properties?propertyStatus=active",
      tone: "bg-emerald-50 text-emerald-700",
      hint: "Live properties for public view",
    },
    {
      label: "Sold",
      value: loading ? "..." : stats.soldProperties,
      icon: Building2,
      href: "/admin/properties?propertyStatus=sold",
      tone: "bg-blue-50 text-blue-700",
      hint: "Completed property sales",
    },
    {
      label: "Rented",
      value: loading ? "..." : stats.rentedProperties,
      icon: DollarSign,
      href: "/admin/properties?propertyStatus=rented",
      tone: "bg-violet-50 text-violet-700",
      hint: "Current and past rental deals",
    },
    {
      label: "Support Requests",
      value: loading ? "..." : stats.supportRequests,
      icon: MailOpen,
      href: "/admin/contacts?status=unread",
      tone: "bg-cyan-50 text-cyan-700",
      hint: "Unread messages from clients",
    },
  ];

  const totalMonthlyRentalRevenue = revenue.monthlyRentedRevenue.reduce(
    (sum, row) => sum + row.total,
    0
  );

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
        {cardItems.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <span className={`rounded-lg p-2 ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">{card.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
