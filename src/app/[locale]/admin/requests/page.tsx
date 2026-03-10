"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { Locale, useRouter } from "@/i18n/routing";
import {
  CheckCircle2,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { supportsBathroomsField, supportsRoomsField } from "@/lib/propertyFloor";
import {
  type ReviewPayload,
  getReviewSource,
  getReviewStatus,
  parseReviewPayload,
} from "@/lib/propertyRequestReview";

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
  review_status: "pending" | "approved" | "declined";
  created_at: string;
}

type LifecycleStage = "all" | "submitted" | "pending" | "approved" | "declined";

function getRequestLifecycleStatus(
  request: PropertyRequest,
  payload: ReviewPayload | null
): Exclude<LifecycleStage, "all"> {
  if (request.review_status) {
    return request.review_status;
  }

  const statusFromPayload = getReviewStatus(payload);
  if (statusFromPayload === "approved" || statusFromPayload === "declined") {
    return statusFromPayload;
  }
  if (statusFromPayload === "submitted" || statusFromPayload === "pending") {
    return statusFromPayload;
  }
  if (payload?.approved_property_id) return "approved";
  if (payload?.declined_at) return "declined";
  if (payload?.pending_at) return "pending";

  return "submitted";
}

function formatStatusBadge(status: Exclude<LifecycleStage, "all">) {
  if (status === "approved") {
    return {
      className:
        "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700",
      text: "Approved",
      tone: "success",
    };
  }
  if (status === "declined") {
    return {
      className:
        "inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700",
      text: "Declined",
      tone: "danger",
    };
  }
  if (status === "pending") {
    return {
      className:
        "inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700",
      text: "Pending",
      tone: "warning",
    };
  }
  if (status === "submitted") {
    return {
      className:
        "inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700",
      text: "Submitted",
      tone: "info",
    };
  }

  return {
    className:
      "inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700",
    text: "Pending",
    tone: "info",
  };
}

export default function AdminRequestsPage() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestStage = searchParams.get("requestStage");
  const lifecycleFilter =
    requestStage === "all" ||
    requestStage === "submitted" ||
    requestStage === "pending" ||
    requestStage === "approved" ||
    requestStage === "declined"
      ? requestStage
      : "all";
  const globalSearch = (searchParams.get("q") || "").trim().toLowerCase();

  const [loading, setLoading] = React.useState(true);
  const [requests, setRequests] = React.useState<PropertyRequest[]>([]);
  const [selected, setSelected] = React.useState<PropertyRequest | null>(null);
  const [showDrawer, setShowDrawer] = React.useState(false);
  const [showDeclineModal, setShowDeclineModal] = React.useState(false);
  const [approvingId, setApprovingId] = React.useState<number | null>(null);
  const [pendingId, setPendingId] = React.useState<number | null>(null);
  const [decliningId, setDecliningId] = React.useState<number | null>(null);
  const [actionMessage, setActionMessage] = React.useState("");
  const [actionError, setActionError] = React.useState("");
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  

  const buildServerFilterQuery = React.useCallback(() => {
    const params = new URLSearchParams();
    params.set("source", "submit_property");

    if (lifecycleFilter !== "all") {
      params.set("requestStage", lifecycleFilter);
    }
  if (globalSearch) {
    params.set("q", searchParams.get("q") ?? "");
  }

  return params;
  }, [globalSearch, lifecycleFilter, searchParams]);

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
    },
    [locale, pathname, router, searchParams]
  );

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    setActionMessage("");
    setActionError("");

    try {
      const query = buildServerFilterQuery();
      const endpoint = `/api/property-requests${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await fetch(endpoint, {
      });

      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error(data?.error || "Failed to load requests");
      }

      setRequests(data);
      setSelected((current) => {
        if (current && data.some((item: PropertyRequest) => item.id === current.id)) {
          return data.find((item) => item.id === current.id) ?? null;
        }
        return data[0] ?? null;
      });
    } catch (error) {
      console.error("Failed to fetch property requests:", error);
      setRequests([]);
      setSelected(null);
      setActionError(
        error instanceof Error ? error.message : "Failed to load property requests"
      );
    } finally {
      setLoading(false);
    }
  }, [buildServerFilterQuery]);

  React.useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const requestRows = React.useMemo(() => {
    const list = requests.filter((request) => {
      const payload = parseReviewPayload(request.description);
      const status = getRequestLifecycleStatus(request, payload);
      const source = getReviewSource(request.description);

      if (source !== "submit_property") {
        return false;
      }

      if (lifecycleFilter !== "all" && lifecycleFilter !== status) {
        return false;
      }

      if (globalSearch) {
        const searchPool = `${request.name} ${request.email} ${request.phone || ""} ${request.category} ${payload?.property?.title || ""}`.toLowerCase();
        if (!searchPool.includes(globalSearch)) {
          return false;
        }
      }

      return true;
    });

    return list;
  }, [globalSearch, lifecycleFilter, requests]);

  const lifecycleStats = React.useMemo(() => {
    const stats = {
      all: requests.length,
      submitted: 0,
      pending: 0,
      approved: 0,
      declined: 0,
    };

    for (const request of requests) {
      const payload = parseReviewPayload(request.description);
      const source = getReviewSource(request.description);
      if (source !== "submit_property") {
        continue;
      }

      const status = getRequestLifecycleStatus(request, payload);
      if (status in stats) {
        stats[status]++;
      }
    }

    return stats;
  }, [requests]);

  React.useEffect(() => {
    if (requestRows.length === 0) {
      setSelected(null);
      setShowDrawer(false);
      return;
    }

    if (!selected) {
      setSelected(requestRows[0]);
      setShowDrawer(true);
      return;
    }

    if (!requestRows.some((request) => request.id === selected.id)) {
      setSelected(requestRows[0]);
      setShowDrawer(true);
    }
  }, [requestRows, selected]);

  const selectedPayload = React.useMemo(
    () => parseReviewPayload(selected?.description ?? null),
    [selected]
  );
  const selectedStatus = selected
    ? getRequestLifecycleStatus(selected, selectedPayload)
    : null;
  const selectedStatusBadge = selectedStatus
    ? formatStatusBadge(selectedStatus)
    : null;
  const approvedPropertyId = selectedPayload?.approved_property_id ?? null;
  const selectedImages = React.useMemo(() => {
    const raw = selectedPayload?.property?.images;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
      .slice(0, 5);
  }, [selectedPayload]);

  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [selected?.id]);

  async function handleApprove() {
    if (!selected) return;

    setActionMessage("");
    setActionError("");
    setApprovingId(selected.id);

    try {
      const res = await fetch(`/api/property-requests/${selected.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok && res.status !== 409) {
        throw new Error(data?.error || "Failed to approve request");
      }

      setActionMessage(
        data?.propertyId
          ? `Approved. Property #${data.propertyId} is now published.`
          : "Approved. Property is now published."
      );
      setShowDrawer(true);
      await fetchRequests();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to approve request"
      );
    } finally {
      setApprovingId(null);
    }
  }

  async function handlePending() {
    if (!selected) return;

    setActionMessage("");
    setActionError("");
    setPendingId(selected.id);

    try {
      const res = await fetch(`/api/property-requests/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to mark request as pending");
      }

      setActionMessage("Request moved back to pending.");
      await fetchRequests();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to update request state"
      );
    } finally {
      setPendingId(null);
    }
  }

  async function handleDecline() {
    if (!selected) return;

    setActionMessage("");
    setActionError("");
    setDecliningId(selected.id);

    try {
      const res = await fetch(`/api/property-requests/${selected.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to decline request");
      }

      setActionMessage("Request declined.");
      setShowDrawer(false);
      setShowDeclineModal(false);
      await fetchRequests();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to decline request"
      );
    } finally {
      setDecliningId(null);
      setShowDeclineModal(false);
    }
  }

  function openRequest(request: PropertyRequest) {
    setSelected(request);
    setShowDrawer(true);
    setActionMessage("");
    setActionError("");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submitted Properties</h1>
          <p className="mt-1 text-sm text-gray-500">Lifecycle review</p>
        </div>
        <span className="text-sm text-gray-500">
          Showing {requestRows.length} request(s)
        </span>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "submitted", label: "Submitted" },
            { key: "pending", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "declined", label: "Declined" },
          ].map((tab) => {
            const active = lifecycleFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => syncQuery({ requestStage: tab.key })}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {tab.label} ({lifecycleStats[tab.key as keyof typeof lifecycleStats]})
              </button>
            );
          })}
        </div>

      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="h-4 animate-pulse rounded bg-gray-200" />
                </div>
              ))
            ) : requestRows.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No matching requests.
              </div>
            ) : (
              requestRows.map((request) => {
                const payload = parseReviewPayload(request.description);
                const stage = getRequestLifecycleStatus(request, payload);
                const status = formatStatusBadge(stage);
                const payloadTitle = payload?.property?.title || "No title provided";

                return (
                  <button
                    key={request.id}
                    onClick={() => openRequest(request)}
                    type="button"
                    className={cn(
                      "w-full px-4 py-4 text-left transition-colors hover:bg-gray-50",
                      selected?.id === request.id && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {payloadTitle}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {request.name} ({request.email})
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={cn("mt-1", status.className)}>{status.text}</span>
                        {selected?.id === request.id && (
                          <span className="mt-1 block text-[11px] font-medium text-blue-600">
                            Open
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

        {showDrawer && selected ? (
          <aside className="max-h-[80vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Request #{selected.id}
              </h2>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                {selected.name}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {selected.email}
              </p>
              {selected.phone ? (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {selected.phone}
                </p>
              ) : null}
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Submitted images
              </p>
              {selectedImages.length > 0 ? (
                <>
                  <a
                    href={normalizeImageUrl(selectedImages[selectedImageIndex])}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeImageUrl(selectedImages[selectedImageIndex])}
                      alt={`Submitted property image ${selectedImageIndex + 1}`}
                      className="h-52 w-full object-cover"
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
                            alt={`Submitted property thumbnail ${index + 1}`}
                            className="h-16 w-20 object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  No images were submitted with this request.
                </p>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              <p>
                <span className="font-medium">Category:</span> {selected.category}
              </p>
              {(selected.min_price ?? selected.max_price) ? (
                <p>
                  <span className="font-medium">Price:</span>{" "}
                  {selected.min_price ?? selected.max_price} EUR
                </p>
              ) : null}
              {selectedPayload?.property?.area ? (
                <p>
                  <span className="font-medium">Area:</span> {selectedPayload.property.area} m²
                </p>
              ) : null}
              {supportsRoomsField(selected.category) && selectedPayload?.property?.rooms ? (
                <p>
                  <span className="font-medium">Rooms:</span> {selectedPayload.property.rooms}
                </p>
              ) : null}
              {supportsBathroomsField(selected.category) && selectedPayload?.property?.bathrooms ? (
                <p>
                  <span className="font-medium">Bathrooms:</span>{" "}
                  {selectedPayload.property.bathrooms}
                </p>
              ) : null}
            </div>

            {selectedPayload?.note ? (
              <div className="mt-3 rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {selectedPayload.note}
                </p>
              </div>
            ) : null}

            {selectedStatus ? (
              <span
                className={cn(
                  "mt-4 inline-flex items-center gap-1 text-xs font-medium",
                  selectedStatusBadge?.className ?? ""
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {selectedStatusBadge?.text}
              </span>
            ) : null}

            {selectedStatus === "approved" && approvedPropertyId ? (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                Approved as property #{approvedPropertyId}
              </p>
            ) : null}

            <p className="mt-2 text-xs text-gray-500">
              Request payload is{" "}
              {selected.description ? "stored as structured payload" : "plain text"}
            </p>

            <div className="mt-4 space-y-2">
              {selectedStatus !== "approved" ? (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approvingId === selected.id}
                  className="inline-flex w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {approvingId === selected.id
                    ? "Approving..."
                    : "Approve & Publish"}
                </button>
              ) : null}
              {selectedStatus !== "pending" ? (
                <button
                  type="button"
                  onClick={handlePending}
                  disabled={pendingId === selected.id}
                  className="inline-flex w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-60"
                >
                  {pendingId === selected.id ? "Setting pending..." : "Set pending"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowDeclineModal(true)}
                disabled={decliningId === selected.id}
                className="inline-flex w-full items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
              >
                {decliningId === selected.id ? "Declining..." : "Decline"}
              </button>
            </div>

            {actionMessage ? (
              <p className="mt-3 text-xs font-medium text-emerald-700">
                {actionMessage}
              </p>
            ) : null}
            {actionError ? (
              <p className="mt-3 text-xs font-medium text-red-600">
                {actionError}
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>

      {showDeclineModal && selected ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <p className="text-lg font-semibold text-gray-900">Decline request</p>
            <p className="mt-2 text-sm text-gray-600">
              This will mark the request as declined and keep it in history for audit.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={decliningId === selected.id}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {decliningId === selected.id ? "Declining..." : "Yes, decline"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
