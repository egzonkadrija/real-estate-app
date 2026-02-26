"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { Mail, MapPin, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyRequest {
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
  created_at: string;
}

interface SubmitReviewPayload {
  source?: string;
  property?: {
    title?: string | null;
    type?: string | null;
    category?: string | null;
    price?: number | null;
    area?: number | null;
    rooms?: number | null;
    bathrooms?: number | null;
    location_id?: number | null;
    location_name?: string | null;
    floor?: number | null;
    year_built?: number | null;
  };
  note?: string | null;
  approved_property_id?: number;
  approved_at?: string;
}

function parseReviewPayload(raw: string | null): SubmitReviewPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as SubmitReviewPayload;
  } catch {
    return null;
  }
}

export default function AdminRequestsPage() {
  const [loading, setLoading] = React.useState(true);
  const [requests, setRequests] = React.useState<PropertyRequest[]>([]);
  const [selected, setSelected] = React.useState<PropertyRequest | null>(null);
  const [approvingId, setApprovingId] = React.useState<number | null>(null);
  const [actionMessage, setActionMessage] = React.useState("");
  const [actionError, setActionError] = React.useState("");

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
  });

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/property-requests", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setRequests(list);
      setSelected((previous) => {
        if (!previous) return list[0] ?? null;
        return list.find((item) => item.id === previous.id) ?? list[0] ?? null;
      });
      return list;
    } catch (error) {
      console.error("Failed to fetch property requests:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleApprove() {
    if (!selected) return;

    setActionMessage("");
    setActionError("");
    setApprovingId(selected.id);

    try {
      const res = await fetch(`/api/property-requests/${selected.id}/approve`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      const data = await res.json().catch(() => null);

      if (!res.ok && res.status !== 409) {
        throw new Error(data?.error || "Failed to approve request");
      }

      const propertyId = data?.propertyId;
      if (propertyId) {
        setActionMessage(`Approved. Property #${propertyId} is now listed.`);
      } else {
        setActionMessage("Approved. Property is now listed.");
      }
      await fetchRequests();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to approve request"
      );
    } finally {
      setApprovingId(null);
    }
  }

  const selectedPayload = parseReviewPayload(selected?.description ?? null);
  const selectedProperty = selectedPayload?.property;
  const approvedPropertyId = selectedPayload?.approved_property_id ?? null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Property Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review submitted properties before creating live listings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                  </div>
                ))
              ) : requests.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No property requests found.
                </div>
              ) : (
                requests.map((request) => {
                  const payload = parseReviewPayload(request.description);
                  const title = payload?.property?.title || "No title";
                  const isApproved = Boolean(payload?.approved_property_id);

                  return (
                    <button
                      key={request.id}
                      onClick={() => setSelected(request)}
                      className={cn(
                        "w-full px-4 py-4 text-left transition-colors hover:bg-gray-50",
                        selected?.id === request.id && "bg-blue-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {request.category} | {request.type}
                          </p>
                          <p className="mt-1 text-xs text-gray-600">
                            {request.name} ({request.email})
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="block text-xs text-gray-400">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          {isApproved && (
                            <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Approved
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div>
          {selected ? (
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">
                Request #{selected.id}
              </h2>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {selected.name}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {selected.email}
                </p>
                {selected.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selected.phone}
                  </p>
                )}
                {selected.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {selected.location}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Type:</span> {selected.type}
                </p>
                <p>
                  <span className="font-medium">Category:</span> {selected.category}
                </p>
                {(selected.min_price ?? selected.max_price) && (
                  <p>
                    <span className="font-medium">Price:</span>{" "}
                    {selected.min_price ?? selected.max_price} EUR
                  </p>
                )}
                {selectedProperty?.area ? (
                  <p>
                    <span className="font-medium">Area:</span> {selectedProperty.area} m²
                  </p>
                ) : null}
                {selectedProperty?.rooms ? (
                  <p>
                    <span className="font-medium">Rooms:</span> {selectedProperty.rooms}
                  </p>
                ) : null}
                {selectedProperty?.bathrooms ? (
                  <p>
                    <span className="font-medium">Bathrooms:</span>{" "}
                    {selectedProperty.bathrooms}
                  </p>
                ) : null}
              </div>

              {selectedProperty?.title && (
                <div className="mt-4 rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Property Title
                  </p>
                  <p className="mt-1 text-sm text-gray-900">{selectedProperty.title}</p>
                </div>
              )}

              {selectedPayload?.note ? (
                <div className="mt-3 rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                    {selectedPayload.note}
                  </p>
                </div>
              ) : selected.description ? (
                <div className="mt-3 rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                    {selected.description}
                  </p>
                </div>
              ) : null}

              <div className="mt-4">
                {approvedPropertyId ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-emerald-700">
                      Already approved as property #{approvedPropertyId}.
                    </p>
                    <Link
                      href="/admin/properties"
                      className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Open Properties
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approvingId === selected.id}
                    className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {approvingId === selected.id ? "Approving..." : "Approve & Publish"}
                  </button>
                )}
                {actionMessage && (
                  <p className="mt-2 text-xs font-medium text-emerald-700">
                    {actionMessage}
                  </p>
                )}
                {actionError && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {actionError}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
              Select a request to review details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
