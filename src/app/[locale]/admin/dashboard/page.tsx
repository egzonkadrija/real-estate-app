"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Building2,
  Mail,
  Users,
  TrendingUp,
  Eye,
  ArrowRight,
} from "lucide-react";

interface Stats {
  totalProperties: number;
  totalContacts: number;
  unreadContacts: number;
  totalAgents: number;
}

interface RecentContact {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [recentContacts, setRecentContacts] = React.useState<RecentContact[]>([]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [propsRes, contactsRes, agentsRes] = await Promise.all([
          fetch("/api/properties?limit=1", { headers: getAuthHeaders() }),
          fetch("/api/contacts", { headers: getAuthHeaders() }),
          fetch("/api/agents"),
        ]);

        const propsData = await propsRes.json();
        const contactsData = await contactsRes.json();
        const agentsData = await agentsRes.json();

        const contacts = Array.isArray(contactsData) ? contactsData : contactsData.data || [];
        const agents = Array.isArray(agentsData) ? agentsData : agentsData.data || [];

        setStats({
          totalProperties: propsData.total || 0,
          totalContacts: contacts.length,
          unreadContacts: contacts.filter((c: RecentContact) => !c.is_read).length,
          totalAgents: agents.length,
        });

        setRecentContacts(contacts.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      label: t("totalProperties"),
      value: stats?.totalProperties ?? "—",
      icon: Building2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: t("totalContacts"),
      value: stats?.totalContacts ?? "—",
      icon: Mail,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: t("unreadMessages"),
      value: stats?.unreadContacts ?? "—",
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: t("totalAgents"),
      value: stats?.totalAgents ?? "—",
      icon: Users,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("dashboard")}</h1>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Contacts */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("recentContacts")}
          </h2>
          <Link
            href="/admin/contacts"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentContacts.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              No contacts yet
            </div>
          ) : (
            recentContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-4 px-6 py-4">
                <div
                  className={`h-2 w-2 rounded-full ${
                    contact.is_read ? "bg-gray-300" : "bg-blue-600"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {contact.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {contact.message}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(contact.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
