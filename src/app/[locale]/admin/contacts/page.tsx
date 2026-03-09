"use client";

import * as React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import {
  getReviewSource,
  parseReviewPayload,
  parseReviewStatus,
} from "@/lib/propertyRequestReview";

interface ContactRecord {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface PropertyRequestRecord {
  id: number;
  type: "buy" | "rent";
  category: string;
  min_price: number | null;
  max_price: number | null;
  location: string | null;
  name: string;
  email: string;
  phone: string | null;
  description: string | null;
  review_status: "pending" | "approved" | "declined";
  created_at: string;
}

type RequestFilter = "all" | "pending" | "approved" | "declined";
type AdminRequestedItem =
  | {
      source: "request_property";
      key: string;
      id: number;
      type: "buy" | "rent";
      category: string;
      location: string | null;
      name: string;
      email: string;
      phone: string | null;
      note: string;
      images: string[];
      status: "pending" | "approved" | "declined";
      min_price: number | null;
      max_price: number | null;
      created_at: string;
    }
  | {
      source: "legacy_contact";
      key: string;
      id: number;
      type: "buy" | "rent";
      category: string;
      location: string | null;
      name: string;
      email: string;
      phone: string | null;
      note: string;
      images: string[];
      status: "pending";
      min_price: number | null;
      max_price: number | null;
      created_at: string;
    };

function isRequestPropertyRecord(request: PropertyRequestRecord) {
  return getReviewSource(request.description) === "request_property";
}

function getStatusBadge(status: RequestFilter | "pending" | "approved" | "declined") {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "declined") {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-amber-100 text-amber-700";
}

function formatBudget(item: AdminRequestedItem) {
  if (item.min_price && item.max_price) {
    return `${item.min_price} - ${item.max_price} EUR`;
  }
  if (item.min_price) {
    return `From ${item.min_price} EUR`;
  }
  if (item.max_price) {
    return `Up to ${item.max_price} EUR`;
  }
  return "Not specified";
}

function buildReplyMailtoForItem(item: AdminRequestedItem) {
  const subject = `Re: ${item.name} - Property request`;
  const body = `Hi ${item.name},\n\nThank you for your property request.\n\n`;
  return `mailto:${item.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function normalizeComparisonValue(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function normalizePhone(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, "").trim();
}

function isLegacyPropertyRequestMessage(message: string) {
  return message.toLowerCase().startsWith("property request from customer");
}

function parseLegacyField(message: string, prefix: string) {
  const line = message
    .split("\n")
    .find((item) => item.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!line) return null;
  return line.slice(prefix.length).trim() || null;
}

function parseLegacyType(message: string): "buy" | "rent" {
  const raw = parseLegacyField(message, "Type:");
  return raw?.toLowerCase() === "rent" ? "rent" : "buy";
}

function parseLegacyNote(message: string) {
  return parseLegacyField(message, "Note:") || "";
}

function parseLegacyCategory(message: string) {
  return parseLegacyField(message, "Category:") || "unspecified";
}

function parseLegacyLocation(message: string) {
  return parseLegacyField(message, "Location:");
}

function isDuplicateSubmitPropertyContact(
  contact: ContactRecord,
  submitRequest: PropertyRequestRecord
) {
  if (normalizeComparisonValue(contact.name) !== normalizeComparisonValue(submitRequest.name)) {
    return false;
  }
  if (normalizeComparisonValue(contact.email) !== normalizeComparisonValue(submitRequest.email)) {
    return false;
  }
  if (normalizePhone(contact.phone) !== normalizePhone(submitRequest.phone)) {
    return false;
  }

  const contactTime = new Date(contact.created_at).getTime();
  const requestTime = new Date(submitRequest.created_at).getTime();
  return Math.abs(contactTime - requestTime) <= 5 * 60 * 1000;
}

export default function AdminContactsPage() {
  const [requests, setRequests] = React.useState<PropertyRequestRecord[]>([]);
  const [submittedRequests, setSubmittedRequests] = React.useState<PropertyRequestRecord[]>([]);
  const [contacts, setContacts] = React.useState<ContactRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<RequestFilter>("all");
  const [selectedRequest, setSelectedRequest] = React.useState<AdminRequestedItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const [requestsRes, submittedRequestsRes, contactsRes] = await Promise.all([
        fetch("/api/property-requests?source=request_property"),
        fetch("/api/property-requests?source=submit_property"),
        fetch("/api/contacts"),
      ]);
      const data = await requestsRes.json();
      const submittedData = await submittedRequestsRes.json().catch(() => []);
      const contactsData = await contactsRes.json().catch(() => []);
      const allRequests = Array.isArray(data) ? (data as PropertyRequestRecord[]) : [];
      const allSubmittedRequests = Array.isArray(submittedData)
        ? (submittedData as PropertyRequestRecord[])
        : [];
      setRequests(allRequests);
      setSubmittedRequests(allSubmittedRequests);
      setContacts(Array.isArray(contactsData) ? (contactsData as ContactRecord[]) : []);
    } catch (error) {
      console.error(error);
      setRequests([]);
      setSubmittedRequests([]);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const items = React.useMemo<AdminRequestedItem[]>(() => {
    const requestPropertyItems = requests
      .filter((request) => isRequestPropertyRecord(request))
      .map((request) => {
        const payload = parseReviewPayload(request.description);
        const images = Array.isArray(payload?.property?.images)
          ? payload.property.images.filter(
              (image): image is string => typeof image === "string" && image.trim().length > 0
            )
          : [];

        return {
          source: "request_property" as const,
          key: `request-${request.id}`,
          id: request.id,
          type: request.type,
          category: request.category,
          location: request.location,
          name: request.name,
          email: request.email,
          phone: request.phone,
          note: payload?.note?.trim() || "",
          images,
          status: parseReviewStatus(request.review_status),
          min_price: request.min_price,
          max_price: request.max_price,
          created_at: request.created_at,
        };
      });

    const legacyContactItems = contacts
      .filter((contact) => isLegacyPropertyRequestMessage(contact.message))
      .filter(
        (contact) =>
          !submittedRequests.some((submitRequest) =>
            isDuplicateSubmitPropertyContact(contact, submitRequest)
          )
      )
      .map((contact) => ({
        source: "legacy_contact" as const,
        key: `contact-${contact.id}`,
        id: contact.id,
        type: parseLegacyType(contact.message),
        category: parseLegacyCategory(contact.message),
        location: parseLegacyLocation(contact.message),
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        note: parseLegacyNote(contact.message),
        images: [],
        status: "pending" as const,
        min_price: null,
        max_price: null,
        created_at: contact.created_at,
      }));

    return [...requestPropertyItems, ...legacyContactItems].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [contacts, requests, submittedRequests]);

  const filteredRequests = React.useMemo(() => {
    if (filter === "all") return items;
    return items.filter((request) => request.status === filter);
  }, [filter, items]);

  React.useEffect(() => {
    setSelectedRequest((current) => {
      if (current) {
        return filteredRequests.find((request) => request.key === current.key) ?? filteredRequests[0] ?? null;
      }
      return filteredRequests[0] ?? null;
    });
  }, [filteredRequests]);

  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedRequest?.id]);

  const selectedImages = React.useMemo(
    () => (selectedRequest ? selectedRequest.images : []),
    [selectedRequest]
  );

  const filterCounts = React.useMemo(
    () => ({
      all: items.length,
      pending: items.filter((request) => request.status === "pending").length,
      approved: items.filter((request) => request.status === "approved").length,
      declined: items.filter((request) => request.status === "declined").length,
    }),
    [items]
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Requested Properties</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {([
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "declined", label: "Declined" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === tab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {tab.label} ({filterCounts[tab.key]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="h-4 animate-pulse rounded bg-gray-200" />
                </div>
              ))
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No requested properties found.
              </div>
            ) : (
              filteredRequests.map((request) => (
                  <button
                    key={request.key}
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50",
                      selectedRequest?.key === request.key && "bg-blue-50"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {request.name}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            getStatusBadge(request.status)
                          )}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {request.category} • {request.type} • {request.location || "No location"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {request.email}
                        {request.images.length > 0
                          ? ` • ${request.images.length} image${request.images.length === 1 ? "" : "s"}`
                          : ""}
                      </p>
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>

        <div>
          {selectedRequest ? (
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                {selectedRequest.name}
              </h3>
              <p className="mb-1 text-sm text-blue-600">{selectedRequest.email}</p>
              {selectedRequest.phone ? (
                <p className="mb-4 text-sm text-gray-500">{selectedRequest.phone}</p>
              ) : null}

              {selectedImages.length > 0 ? (
                <div className="mb-4 rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Uploaded images
                  </p>
                  <a
                    href={normalizeImageUrl(selectedImages[selectedImageIndex])}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeImageUrl(selectedImages[selectedImageIndex])}
                      alt={`Requested property image ${selectedImageIndex + 1}`}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                  {selectedImages.length > 1 ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {selectedImages.map((url, index) => (
                        <button
                          key={`${url}-${index}`}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={cn(
                            "overflow-hidden rounded-lg border-2",
                            selectedImageIndex === index
                              ? "border-blue-500"
                              : "border-transparent"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={normalizeImageUrl(url)}
                            alt={`Requested property thumbnail ${index + 1}`}
                            className="h-16 w-20 object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {selectedRequest.location || "No location provided"}
                </p>
                <p className="mt-2">
                  <span className="font-medium">Category:</span> {selectedRequest.category}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Type:</span> {selectedRequest.type}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Budget:</span> {formatBudget(selectedRequest)}
                </p>
              </div>

              {selectedRequest.note ? (
                <div className="mb-4 rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {selectedRequest.note}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {selectedRequest.email}
                </p>
                {selectedRequest.phone ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selectedRequest.phone}
                  </p>
                ) : null}
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Received: {new Date(selectedRequest.created_at).toLocaleString()}
              </p>

              <a
                href={buildReplyMailtoForItem(selectedRequest)}
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
                Select a requested property to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
