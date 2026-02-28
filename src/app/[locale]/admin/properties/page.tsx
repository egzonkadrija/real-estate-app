"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Locale, useRouter } from "@/i18n/routing";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, getLocalizedField } from "@/lib/utils";
import { PROPERTY_CATEGORIES, PROPERTY_TYPES } from "@/lib/constants";
import { getBrowserAdminAuthHeaders } from "@/lib/adminAuth";

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

interface AgentOption {
  id: number;
  name: string;
}

export default function AdminPropertiesPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusFilter = searchParams.get("propertyStatus") || searchParams.get("status") || "all";
  const typeFilter = searchParams.get("propertyType") || "all";
  const agentFilter = searchParams.get("agentId") || "all";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";
  const globalSearch = searchParams.get("q") || "";

  const [properties, setProperties] = React.useState<PropertyItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [markingAsSoldId, setMarkingAsSoldId] = React.useState<number | null>(null);
  const [agentsForFilter, setAgentsForFilter] = React.useState<AgentOption[]>([]);

  const syncQuery = React.useCallback(
    (patch: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (!value || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const query = params.toString();
      const target = query ? `${pathname}?${query}` : pathname;
      router.replace(target, { locale });
      setPage(1);
    },
    [locale, pathname, router, searchParams]
  );

  function getAuthHeaders(extraHeaders?: HeadersInit) {
    return getBrowserAdminAuthHeaders(extraHeaders);
  }

  const formatAgentFilter = React.useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgentsForFilter(
        Array.isArray(data)
          ? data.map((item: { id: number; name: string }) => ({
              id: item.id,
              name: item.name,
            }))
          : []
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchProperties = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (agentFilter !== "all") params.set("agentId", agentFilter);
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      if (globalSearch) params.set("q", globalSearch);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.data || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [agentFilter, fromDate, globalSearch, page, statusFilter, toDate, typeFilter]);

  React.useEffect(() => {
    formatAgentFilter();
  }, [formatAgentFilter]);

  React.useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await fetch(`/api/properties/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      setProperties((previous) => {
        const next = previous.filter((property) => property.id !== id);
        if (next.length === 0 && page > 1) {
          setPage((current) => Math.max(1, current - 1));
        }
        return next;
      });
      setTotal((previous) => Math.max(0, previous - 1));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMarkSold(id: number) {
    if (!confirm("Mark this property as sold and remove it from this list?")) return;
    setMarkingAsSoldId(id);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status: "sold" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to mark property as sold");
      }
      setProperties((previous) => {
        const next = previous.filter((property) => property.id !== id);
        if (next.length === 0 && page > 1) {
          setPage((current) => Math.max(1, current - 1));
        }
        return next;
      });
      setTotal((previous) => Math.max(0, previous - 1));
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAsSoldId(null);
    }
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("admin.properties")}
        </h1>
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
      <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5">
        <select
          value={statusFilter}
          onChange={(e) => syncQuery({ propertyStatus: e.target.value })}
          className="rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => syncQuery({ propertyType: e.target.value })}
          className="rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="all">Type: All</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
        <select
          value={agentFilter}
          onChange={(e) => syncQuery({ agentId: e.target.value })}
          className="rounded-lg border border-gray-300 p-2 text-sm"
        >
          <option value="all">Agent: All</option>
          {agentsForFilter.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
        <div className="flex items-center rounded-lg border border-gray-300 px-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => syncQuery({ fromDate: e.target.value })}
            className="h-9 w-full text-sm outline-none"
          />
        </div>
        <div className="flex items-center rounded-lg border border-gray-300 px-2">
          <input
            type="date"
            value={toDate}
            onChange={(e) => syncQuery({ toDate: e.target.value })}
            className="h-9 w-full text-sm outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            syncQuery({
              propertyStatus: "all",
              propertyType: "all",
              agentId: "all",
              fromDate: "",
              toDate: "",
            })
          }
          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 md:col-span-2 lg:col-span-1"
        >
          Reset filters
        </button>
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
              {loading ? (
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
                properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 overflow-hidden rounded bg-gray-100">
                          {prop.images?.[0] && (
                            <Image
                              src={prop.images[0].url}
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
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          {
                            "bg-green-50 text-green-700": prop.status === "active",
                            "bg-yellow-50 text-yellow-700": prop.status === "pending",
                            "bg-gray-100 text-gray-700": prop.status === "sold" || prop.status === "rented",
                          }
                        )}
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
                          onClick={() => {
                            setEditingId(prop.id);
                            setShowForm(true);
                          }}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                    <button
                          onClick={() => handleDelete(prop.id)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {prop.status !== "sold" ? (
                          <button
                            onClick={() => handleMarkSold(prop.id)}
                            disabled={markingAsSoldId === prop.id}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-60"
                          >
                            {markingAsSoldId === prop.id ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Sold
                              </span>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Sold</span>
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
            fetchProperties();
          }}
        />
      )}
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

  function getAuthHeaders(extraHeaders?: HeadersInit) {
    return getBrowserAdminAuthHeaders(extraHeaders);
  }

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
          headers: getAuthHeaders(),
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
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
                    <Image src={url} alt="" fill className="object-cover" sizes="96px" />
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
