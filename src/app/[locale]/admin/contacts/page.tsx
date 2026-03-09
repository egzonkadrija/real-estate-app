"use client";

import * as React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { parseReviewPayload, parseReviewStatus } from "@/lib/propertyRequestReview";

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

function isRequestPropertyRecord(request: PropertyRequestRecord) {
  return parseReviewPayload(request.description)?.source === "request_property";
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

function getDisplayNote(request: PropertyRequestRecord) {
  return parseReviewPayload(request.description)?.note?.trim() || "";
}

function getRequestImages(request: PropertyRequestRecord) {
  const images = parseReviewPayload(request.description)?.property?.images;
  if (!Array.isArray(images)) return [];
  return images.filter(
    (image): image is string => typeof image === "string" && image.trim().length > 0
  );
}

function formatBudget(request: PropertyRequestRecord) {
  if (request.min_price && request.max_price) {
    return `${request.min_price} - ${request.max_price} EUR`;
  }
  if (request.min_price) {
    return `From ${request.min_price} EUR`;
  }
  if (request.max_price) {
    return `Up to ${request.max_price} EUR`;
  }
  return "Not specified";
}

function buildReplyMailto(request: PropertyRequestRecord) {
  const subject = `Re: ${request.name} - Property request`;
  const body = `Hi ${request.name},\n\nThank you for your property request.\n\n`;
  return `mailto:${request.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AdminContactsPage() {
  const [requests, setRequests] = React.useState<PropertyRequestRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<RequestFilter>("all");
  const [selectedRequest, setSelectedRequest] = React.useState<PropertyRequestRecord | null>(
    null
  );
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/property-requests");
      const data = await res.json();
      const allRequests = Array.isArray(data) ? (data as PropertyRequestRecord[]) : [];
      const requestPropertyRows = allRequests.filter(isRequestPropertyRecord);
      setRequests(requestPropertyRows);
      setSelectedRequest((current) => {
        if (current) {
          return requestPropertyRows.find((request) => request.id === current.id) ?? null;
        }
        return requestPropertyRows[0] ?? null;
      });
    } catch (error) {
      console.error(error);
      setRequests([]);
      setSelectedRequest(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = React.useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter(
      (request) => parseReviewStatus(request.review_status) === filter
    );
  }, [filter, requests]);

  React.useEffect(() => {
    if (selectedRequest && !filteredRequests.some((request) => request.id === selectedRequest.id)) {
      setSelectedRequest(filteredRequests[0] ?? null);
    }
  }, [filteredRequests, selectedRequest]);

  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedRequest?.id]);

  const selectedImages = React.useMemo(
    () => (selectedRequest ? getRequestImages(selectedRequest) : []),
    [selectedRequest]
  );

  const filterCounts = React.useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((request) => parseReviewStatus(request.review_status) === "pending")
        .length,
      approved: requests.filter(
        (request) => parseReviewStatus(request.review_status) === "approved"
      ).length,
      declined: requests.filter(
        (request) => parseReviewStatus(request.review_status) === "declined"
      ).length,
    }),
    [requests]
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
              filteredRequests.map((request) => {
                const status = parseReviewStatus(request.review_status);
                const images = getRequestImages(request);

                return (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50",
                      selectedRequest?.id === request.id && "bg-blue-50"
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
                            getStatusBadge(status)
                          )}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {request.category} • {request.type} • {request.location || "No location"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {request.email}
                        {images.length > 0 ? ` • ${images.length} image${images.length === 1 ? "" : "s"}` : ""}
                      </p>
                    </div>
                  </button>
                );
              })
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

              {getDisplayNote(selectedRequest) ? (
                <div className="mb-4 rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {getDisplayNote(selectedRequest)}
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
                href={buildReplyMailto(selectedRequest)}
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
