import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { properties, propertyRequests } from "@/db/schema";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { notifyPropertyRequestStatus } from "@/lib/propertyRequestNotifications";
import { z } from "zod";

interface ReviewPayload {
  source?: string;
  property?: Record<string, unknown>;
  note?: string | null;
  approved_property_id?: number;
  approved_at?: string;
  declined_at?: string;
  review_status?: "pending" | "approved" | "declined";
  pending_at?: string | null;
}

const reviewStatusSchema = z.object({
  status: z.enum(["pending", "declined"]),
});

const REVIEW_STATUSES = new Set(["pending", "approved", "declined"]);

function isReviewStatus(value: unknown): value is "pending" | "approved" | "declined" {
  return typeof value === "string" && REVIEW_STATUSES.has(value);
}

function getReviewStatus(payload: ReviewPayload | null): "pending" | "approved" | "declined" {
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

async function setApprovedPropertyPending(propertyId: number): Promise<void> {
  await db
    .update(properties)
    .set({ status: "pending", updated_at: new Date() })
    .where(eq(properties.id, propertyId));
}

function parsePayload(raw: string | null): ReviewPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ReviewPayload;
  } catch {
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromHeader(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const requestId = Number(id);
    if (Number.isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const [requestItem] = await db
      .select()
      .from(propertyRequests)
      .where(eq(propertyRequests.id, requestId))
      .limit(1);

    if (!requestItem) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const payload = parsePayload(requestItem.description);
    const currentStatus =
      requestItem.review_status ??
      getReviewStatus(payload);
    if (payload?.approved_property_id) {
      await setApprovedPropertyPending(payload.approved_property_id);
    }

    if (currentStatus === "declined") {
      return NextResponse.json({ message: "Request already declined" }, { status: 200 });
    }

    const updatedPayload: ReviewPayload = {
      ...(payload ?? {}),
      source: payload?.source || "submit_property",
      review_status: "declined",
      declined_at: new Date().toISOString(),
      pending_at: null,
    };
    updatedPayload.approved_property_id = undefined;
    updatedPayload.approved_at = undefined;

    await db
      .update(propertyRequests)
      .set({
        description: JSON.stringify(updatedPayload),
        review_status: "declined",
      })
      .where(eq(propertyRequests.id, requestId));

    void notifyPropertyRequestStatus({
      recipientEmail: requestItem.email,
      recipientName: requestItem.name,
      status: "declined",
      requestType: requestItem.type,
      category: requestItem.category,
      location: requestItem.location,
    });

    return NextResponse.json({ message: "Request declined" });
  } catch (error) {
    console.error("Error declining property request:", error);
    return NextResponse.json(
      { error: "Failed to decline property request" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromHeader(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const requestId = Number(id);
    if (Number.isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = reviewStatusSchema.parse(body);
    const { status } = parsed;

    const [requestItem] = await db
      .select()
      .from(propertyRequests)
      .where(eq(propertyRequests.id, requestId))
      .limit(1);

    if (!requestItem) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const payload = parsePayload(requestItem.description);
    const currentStatus =
      requestItem.review_status ??
      getReviewStatus(payload);
    const now = new Date().toISOString();
    const approvedPropertyId = typeof payload?.approved_property_id === "number"
      ? payload.approved_property_id
      : null;
    const shouldUnpublishApprovedProperty =
      currentStatus === "approved" && approvedPropertyId !== null;

    const updatedPayload: ReviewPayload = {
      ...(payload ?? {}),
      source: payload?.source || "submit_property",
      review_status: status,
      pending_at: null,
      declined_at: null,
    };

    if (status === "pending") {
      updatedPayload.pending_at = now;
      if (shouldUnpublishApprovedProperty) {
        await setApprovedPropertyPending(approvedPropertyId);
      }
    } else {
      updatedPayload.declined_at = now;
      if (shouldUnpublishApprovedProperty) {
        await setApprovedPropertyPending(approvedPropertyId);
      }
    }

    updatedPayload.approved_property_id = undefined;
    updatedPayload.approved_at = undefined;

    await db
      .update(propertyRequests)
      .set({
        description: JSON.stringify(updatedPayload),
        review_status: status,
      })
      .where(eq(propertyRequests.id, requestId));

    void notifyPropertyRequestStatus({
      recipientEmail: requestItem.email,
      recipientName: requestItem.name,
      status,
      requestType: requestItem.type,
      category: requestItem.category,
      location: requestItem.location,
    });

    return NextResponse.json({
      message:
        status === "pending"
          ? "Request marked as pending"
          : "Request marked as declined",
      status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status payload" },
        { status: 400 }
      );
    }
    console.error("Error updating property request status:", error);
    return NextResponse.json(
      { error: "Failed to update property request status" },
      { status: 500 }
    );
  }
}
