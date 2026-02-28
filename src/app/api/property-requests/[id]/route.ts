import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { properties, propertyRequests } from "@/db/schema";
import { notifyPropertyRequestStatus } from "@/lib/propertyRequestNotifications";
import { z } from "zod";
import {
  parseNumericId,
  requireAuth,
  validationErrorResponse,
} from "@/lib/apiRouteUtils";
import {
  type ReviewPayload,
  getReviewStatus,
  parseReviewPayload,
} from "@/lib/propertyRequestReview";

const reviewStatusSchema = z.object({
  status: z.enum(["pending", "declined"]),
});

async function setApprovedPropertyPending(propertyId: number): Promise<void> {
  await db
    .update(properties)
    .set({ status: "pending", updated_at: new Date() })
    .where(eq(properties.id, propertyId));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const parsedId = await parseNumericId(params, "Invalid request id");
    if (parsedId instanceof NextResponse) return parsedId;
    const requestId = parsedId;

    const [requestItem] = await db
      .select()
      .from(propertyRequests)
      .where(eq(propertyRequests.id, requestId))
      .limit(1);

    if (!requestItem) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const payload = parseReviewPayload(requestItem.description);
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
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const parsedId = await parseNumericId(params, "Invalid request id");
    if (parsedId instanceof NextResponse) return parsedId;
    const requestId = parsedId;

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

    const payload = parseReviewPayload(requestItem.description);
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
      return validationErrorResponse(error, "Invalid status payload");
    }
    console.error("Error updating property request status:", error);
    return NextResponse.json(
      { error: "Failed to update property request status" },
      { status: 500 }
    );
  }
}
