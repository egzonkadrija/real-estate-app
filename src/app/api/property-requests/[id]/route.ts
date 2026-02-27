import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { propertyRequests } from "@/db/schema";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";

interface ReviewPayload {
  source?: string;
  property?: Record<string, unknown>;
  note?: string | null;
  approved_property_id?: number;
  approved_at?: string;
  declined_at?: string;
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
    };

    await db
      .update(propertyRequests)
      .set({ description: JSON.stringify(updatedPayload) })
      .where(eq(propertyRequests.id, requestId));

    return NextResponse.json({ message: "Request declined" });
  } catch (error) {
    console.error("Error declining property request:", error);
    return NextResponse.json(
      { error: "Failed to decline property request" },
      { status: 500 }
    );
  }
}
