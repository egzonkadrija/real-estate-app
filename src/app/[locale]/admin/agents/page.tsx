"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Edit,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { getBrowserAdminAuthHeaders } from "@/lib/adminAuth";

interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  bio_al: string | null;
  bio_en: string | null;
  bio_de: string | null;
  totalProperties?: number;
  soldProperties?: number;
  soldRevenue?: number;
  properties?: AgentProperty[];
}

interface AgentProperty {
  id: number;
  title: string;
  status: "active" | "pending" | "sold" | "rented";
  type: "sale" | "rent";
  price: number | null;
}

function formatPrice(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusCount(
  properties: AgentProperty[] | undefined,
  status: AgentProperty["status"]
) {
  return properties?.filter((property) => property.status === status).length ?? 0;
}

export default function AdminAgentsPage() {
  const t = useTranslations("admin");
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<Agent | null>(null);

  function getAuthHeaders(extraHeaders?: HeadersInit) {
    return getBrowserAdminAuthHeaders(extraHeaders);
  }

  const fetchAgents = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/agents/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      fetchAgents();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("agents")}</h1>
        <button
          onClick={() => {
            setEditingAgent(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gray-200" />
                <div className="mx-auto mb-2 h-4 w-32 rounded bg-gray-200" />
                <div className="mx-auto h-3 w-40 rounded bg-gray-200" />
              </div>
            ))
          : agents.map((agent) => {
              const activeCount = getStatusCount(agent.properties, "active");
              const pendingCount = getStatusCount(agent.properties, "pending");
              const soldCount = getStatusCount(agent.properties, "sold");
              const rentedCount = getStatusCount(agent.properties, "rented");
              const totalProperties = agent.totalProperties ?? 0;

              return (
                <div
                  key={agent.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                        {agent.avatar ? (
                          <Image
                            src={agent.avatar}
                            alt={agent.name}
                            width={64}
                            height={64}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-7 w-7 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-gray-500">{agent.email}</p>
                        <p className="text-xs text-gray-500">{agent.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-right text-xs text-gray-500">
                      <p>Active: {activeCount}</p>
                      <p>Pending: {pendingCount}</p>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm">
                      <p className="text-xs text-blue-700">Total</p>
                      <p className="font-semibold text-blue-900">{totalProperties}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm">
                      <p className="text-xs text-emerald-700">Sold</p>
                      <p className="font-semibold text-emerald-900">{soldCount}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm">
                      <p className="text-xs text-amber-700">Rented</p>
                      <p className="font-semibold text-amber-900">{rentedCount}</p>
                    </div>
                    <div className="rounded-lg bg-violet-50 px-3 py-2 text-sm">
                      <p className="text-xs text-violet-700">Revenue</p>
                      <p className="font-semibold text-violet-900">
                        {formatPrice(agent.soldRevenue ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingAgent(agent);
                        setShowForm(true);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
      </div>

      {showForm && (
        <AgentFormModal
          agent={editingAgent}
          onClose={() => {
            setShowForm(false);
            setEditingAgent(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditingAgent(null);
            fetchAgents();
          }}
        />
      )}
    </div>
  );
}

function AgentFormModal({
  agent,
  onClose,
  onSaved,
}: {
  agent: Agent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  function getAuthHeaders(extraHeaders?: HeadersInit) {
    return getBrowserAdminAuthHeaders(extraHeaders);
  }
  const [formData, setFormData] = React.useState({
    name: agent?.name || "",
    email: agent?.email || "",
    phone: agent?.phone || "",
    avatar: agent?.avatar || "",
    bio_al: agent?.bio_al || "",
    bio_en: agent?.bio_en || "",
    bio_de: agent?.bio_de || "",
  });

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: getAuthHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.url) setFormData((prev) => ({ ...prev, avatar: data.url }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = agent ? `/api/agents/${agent.id}` : "/api/agents";
      const method = agent ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(formData),
      });
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">
            {agent ? "Edit Agent" : "Add Agent"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                {formData.avatar ? (
                  <Image
                    src={formData.avatar}
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Users className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                <Upload className="mr-1 inline h-4 w-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Name *
              </label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Phone *
              </label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Bio (Albanian)
              </label>
              <textarea
                value={formData.bio_al}
                onChange={(e) => setFormData({ ...formData, bio_al: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Bio (English)
              </label>
              <textarea
                value={formData.bio_en}
                onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Bio (German)
              </label>
              <textarea
                value={formData.bio_de}
                onChange={(e) => setFormData({ ...formData, bio_de: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
