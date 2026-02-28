"use client";

import * as React from "react";
import { Mail, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBrowserAdminAuthHeaders } from "@/lib/adminAuth";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  property_id: number | null;
}

function isPropertyRequestMessage(message: string) {
  return message.toLowerCase().startsWith("property request from customer");
}

function buildReplyMailto(contact: Contact) {
  const subject = `Re: ${contact.name} - Inquiry`;
  const body = `Hi ${contact.name},\n\nThank you for reaching out.\n\n`;

  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all");
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);

  function getAuthHeaders(extraHeaders?: HeadersInit) {
    return getBrowserAdminAuthHeaders(extraHeaders);
  }

  const fetchContacts = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/contacts";
      if (filter === "unread") url += "?is_read=false";
      if (filter === "read") url += "?is_read=true";
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  async function markAsRead(id: number) {
    try {
      await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      fetchContacts();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Requested Properties</h1>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {f === "all" ? "All" : f === "unread" ? "Unread" : "Read"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Contact List */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                  </div>
                ))
              ) : contacts.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No contacts found
                </div>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setSelectedContact(contact);
                      if (!contact.is_read) markAsRead(contact.id);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50",
                      selectedContact?.id === contact.id && "bg-blue-50",
                      !contact.is_read && "bg-blue-50/50"
                    )}
                  >
                    {contact.is_read ? (
                      <MailOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    ) : (
                      <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-sm", !contact.is_read && "font-semibold")}>
                            {contact.name}
                          </p>
                          {isPropertyRequestMessage(contact.message) ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              Request
                            </span>
                          ) : null}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-gray-600">
                        {contact.message}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Contact Detail */}
        <div>
          {selectedContact ? (
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                {selectedContact.name}
              </h3>
              <p className="mb-1 text-sm text-blue-600">{selectedContact.email}</p>
              {selectedContact.phone && (
                <p className="mb-4 text-sm text-gray-500">{selectedContact.phone}</p>
              )}
              <div className="mb-4 rounded-lg bg-gray-50 p-4">
                {isPropertyRequestMessage(selectedContact.message) ? (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Property request notification
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {selectedContact.message}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Received: {new Date(selectedContact.created_at).toLocaleString()}
              </p>
              <a
                href={buildReplyMailto(selectedContact)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Mail className="mr-2 h-4 w-4" />
                Reply
              </a>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <Mail className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                Select a message to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
