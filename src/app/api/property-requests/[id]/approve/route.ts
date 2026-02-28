import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { agents, locations, properties, propertyRequests } from "@/db/schema";
import { notifyPropertyRequestStatus } from "@/lib/propertyRequestNotifications";
import { parseNumericId, requireAuth } from "@/lib/apiRouteUtils";
import {
  type ReviewPayload,
  getReviewStatus,
  parseReviewPayload,
} from "@/lib/propertyRequestReview";
import {
  propertyCategorySchema,
  type PropertyCategoryValue,
  type PropertyTypeValue,
} from "@/lib/propertyValidation";

function sanitizeText(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function toPositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  const parsed = Math.round(value);
  return parsed > 0 ? parsed : fallback;
}

function toNullableInteger(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.round(value);
}

function normalizeCategory(value: string | null | undefined): PropertyCategoryValue {
  const parsed = propertyCategorySchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return "apartment";
}

function normalizeType(
  payloadType: string | null | undefined,
  requestType: "buy" | "rent"
): PropertyTypeValue {
  if (payloadType === "sale" || payloadType === "rent") return payloadType;
  return requestType === "rent" ? "rent" : "sale";
}

export async function POST(
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

    const parsedPayload = parseReviewPayload(requestItem.description);
    const currentStatus =
      requestItem.review_status ??
      getReviewStatus(parsedPayload);
    if (currentStatus === "approved") {
      return NextResponse.json(
        {
          message: "Request already approved",
          propertyId: parsedPayload?.approved_property_id,
        },
        { status: 409 }
      );
    }

    const payloadProperty = parsedPayload?.property;
    const category = normalizeCategory(payloadProperty?.category ?? requestItem.category);
    const type = normalizeType(payloadProperty?.type, requestItem.type);
    const price = toPositiveInteger(
      payloadProperty?.price ?? requestItem.max_price ?? requestItem.min_price,
      1
    );
    const area = toPositiveInteger(payloadProperty?.area, 1);
    const rooms = toNullableInteger(payloadProperty?.rooms);
    const bathrooms = toNullableInteger(payloadProperty?.bathrooms);
    const floor = toNullableInteger(payloadProperty?.floor);
    const yearBuilt = toNullableInteger(payloadProperty?.year_built);

    let locationId = toNullableInteger(payloadProperty?.location_id);
    if (!locationId && requestItem.location) {
      const [matchedLocation] = await db
        .select({ id: locations.id })
        .from(locations)
        .where(
          and(
            eq(locations.type, "city"),
            sql`(
              lower(${locations.name_al}) = lower(${requestItem.location}) OR
              lower(${locations.name_en}) = lower(${requestItem.location}) OR
              lower(${locations.name_de}) = lower(${requestItem.location})
            )`
          )
        )
        .limit(1);

      locationId = matchedLocation?.id ?? null;
    }

    if (!locationId) {
      const [fallbackCity] = await db
        .select({ id: locations.id })
        .from(locations)
        .where(eq(locations.type, "city"))
        .limit(1);

      locationId = fallbackCity?.id ?? null;
    }

    if (!locationId) {
      return NextResponse.json(
        { error: "No city location available for listing." },
        { status: 400 }
      );
    }

    const [defaultAgent] = await db
      .select({ id: agents.id })
      .from(agents)
      .limit(1);

    if (!defaultAgent) {
      return NextResponse.json(
        { error: "No agents found. Add at least one agent first." },
        { status: 400 }
      );
    }

    const title = sanitizeText(payloadProperty?.title, `${category} listing`);
    const description = sanitizeText(
      parsedPayload?.note ?? requestItem.description,
      `Submitted by ${requestItem.name} (${requestItem.email})`
    );

    const [createdProperty] = await db
      .insert(properties)
      .values({
        title_al: title,
        title_en: title,
        title_de: title,
        description_al: description,
        description_en: description,
        description_de: description,
        type,
        category,
        price,
        currency: "EUR",
        surface_area: area,
        rooms,
        bathrooms,
        floor,
        year_built: yearBuilt,
        latitude: null,
        longitude: null,
        location_id: locationId,
        agent_id: defaultAgent.id,
        featured: false,
        status: "active",
        amenities: [],
      })
      .returning({ id: properties.id });

    const updatedPayload: ReviewPayload = {
      ...(parsedPayload || {}),
      source: parsedPayload?.source || "submit_property",
      property: {
        ...(payloadProperty || {}),
      },
      note: parsedPayload?.note ?? null,
      review_status: "approved",
      declined_at: undefined,
      pending_at: null,
      approved_at: new Date().toISOString(),
      approved_property_id: createdProperty.id,
    };

    await db
      .update(propertyRequests)
      .set({
        description: JSON.stringify(updatedPayload),
        review_status: "approved",
      })
      .where(eq(propertyRequests.id, requestId));

    void notifyPropertyRequestStatus({
      recipientEmail: requestItem.email,
      recipientName: requestItem.name,
      status: "approved",
      requestType: requestItem.type,
      category: requestItem.category,
      location: requestItem.location,
      propertyId: createdProperty.id,
    });

    return NextResponse.json({
      message: "Request approved and property created",
      propertyId: createdProperty.id,
    });
  } catch (error) {
    console.error("Error approving property request:", error);
    return NextResponse.json(
      { error: "Failed to approve property request" },
      { status: 500 }
    );
  }
}
