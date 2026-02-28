export type ReviewStatus = "pending" | "approved" | "declined";

export type ReviewPayloadProperty = {
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

export interface ReviewPayload {
  source?: string;
  property?: ReviewPayloadProperty;
  note?: string | null;
  approved_property_id?: number;
  approved_at?: string;
  declined_at?: string | null;
  review_status?: ReviewStatus;
  pending_at?: string | null;
}

const REVIEW_STATUSES = new Set<ReviewStatus>([
  "pending",
  "approved",
  "declined",
]);

export function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === "string" && REVIEW_STATUSES.has(value as ReviewStatus);
}

export function parseReviewStatus(value: unknown): ReviewStatus {
  if (isReviewStatus(value)) {
    return value;
  }
  return "pending";
}

export function parseReviewPayload(raw: string | null): ReviewPayload | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ReviewPayload;
  } catch {
    return null;
  }
}

export function getReviewStatus(payload: ReviewPayload | null): ReviewStatus {
  if (isReviewStatus(payload?.review_status)) {
    return payload.review_status;
  }
  if (payload?.approved_property_id) {
    return "approved";
  }
  if (payload?.declined_at) {
    return "declined";
  }
  return "pending";
}
