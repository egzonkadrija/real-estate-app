"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus, Edit, Trash2, X, Users, Upload } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  bio_al: string | null;
  bio_en: string | null;
  bio_de: string | null;
}

export default function AdminAgentsPage() {
  const t = useTranslations("admin");
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<Agent | null>(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
    "Content-Type": "application/json",
  });

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
        headers: getAuthHeaders(),
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

      {/* Agents Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gray-200" />
                <div className="mx-auto mb-2 h-4 w-32 rounded bg-gray-200" />
                <div className="mx-auto h-3 w-40 rounded bg-gray-200" />
              </div>
            ))
          : agents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                    {agent.avatar ? (
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-500">{agent.email}</p>
                  <p className="text-sm text-gray-500">{agent.phone}</p>
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
            ))}
      </div>

      {/* Agent Form Modal */}
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
        headers: { Authorization: `Bearer ${localStorage.getItem("admin-token")}` },
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
          "Content-Type": "application/json",
        },
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
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                <Upload className="mr-1 inline h-4 w-4" />
                Upload Photo
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Name *</label>
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Phone *</label>
              <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Bio (Albanian)</label>
              <textarea value={formData.bio_al} onChange={(e) => setFormData({ ...formData, bio_al: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Bio (English)</label>
              <textarea value={formData.bio_en} onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Bio (German)</label>
              <textarea value={formData.bio_de} onChange={(e) => setFormData({ ...formData, bio_de: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
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
