import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { propertyRequests } from "@/db/schema";
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
  pending_at?: string | null;
}

const reviewStatusSchema = z.object({
  status: z.enum(["pending", "declined"]),
});

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
    if (payload?.approved_property_id) {
      return NextResponse.json({ error: "Approved request cannot be declined" }, { status: 409 });
    }

    if (payload?.declined_at) {
      return NextResponse.json({ message: "Request already declined" }, { status: 200 });
    }

    const updatedPayload: ReviewPayload = {
      ...(payload ?? {}),
      source: payload?.source || "submit_property",
      declined_at: new Date().toISOString(),
      pending_at: null,
    };

    await db
      .update(propertyRequests)
      .set({ description: JSON.stringify(updatedPayload) })
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
    if (payload?.approved_property_id && status !== "pending") {
      return NextResponse.json(
        { error: "Approved request cannot be changed" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const updatedPayload: ReviewPayload = {
      ...(payload ?? {}),
      source: payload?.source || "submit_property",
      pending_at: null,
      declined_at: null,
    };

    if (status === "pending") {
      updatedPayload.pending_at = now;
    } else {
      updatedPayload.declined_at = now;
    }

    await db
      .update(propertyRequests)
      .set({ description: JSON.stringify(updatedPayload) })
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
