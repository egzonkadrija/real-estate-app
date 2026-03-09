import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts, propertyRequests } from "@/db/schema";
import { type SQLWrapper, and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, validationErrorResponse } from "@/lib/apiRouteUtils";

const createPropertyRequestSchema = z.object({
  type: z.enum(["buy", "rent", "sale"]),
  category: z.string().min(1, "Category is required"),
  min_price: z.number().int().nullable().optional(),
  max_price: z.number().int().nullable().optional(),
  location: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

function getDisplayNote(raw: string | null | undefined) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const payload =
        typeof parsed === "string" ? JSON.parse(parsed) : parsed;

      if (
        payload &&
        typeof payload === "object" &&
        "source" in payload &&
        payload.source === "submit_property"
      ) {
        return null;
      }
    } catch {
      // Keep non-JSON notes as-is.
    }
  }

  return trimmed;
}

function buildContactMessage(
  request: typeof propertyRequests.$inferInsert
) {
  const typeLabel = request.type === "rent" ? "Rent" : "Buy";
  const priceRange = request.min_price || request.max_price
    ? [
        request.min_price ? `Min ${request.min_price}` : null,
        request.max_price ? `Max ${request.max_price}` : null,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  const lines = [
    "Property request from customer",
    `Type: ${typeLabel}`,
    `Category: ${request.category}`,
  ];

  if (request.location) {
    lines.push(`Location: ${request.location}`);
  }

  if (priceRange) {
    lines.push(`Budget: ${priceRange} EUR`);
  }

  if (request.phone) {
    lines.push(`Phone: ${request.phone}`);
  }

  lines.push(`Name: ${request.name}`);
  lines.push(`Email: ${request.email}`);

  const displayNote = getDisplayNote(request.description);
  if (displayNote) {
    lines.push(`Note: ${displayNote}`);
  }

  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim() || "";
    const requestStage = searchParams.get("requestStage") || "all";
    const requestType = searchParams.get("requestType") || "";
    const requestLocation = searchParams.get("requestLocation") || "";
    const fromDate = searchParams.get("requestFrom") || "";
    const toDate = searchParams.get("requestTo") || "";

    const filters: SQLWrapper[] = [];

    if (q) {
      const term = `%${q}%`;
      filters.push(
        sql`(
          lower(${propertyRequests.name}) LIKE lower(${term}) OR
          lower(${propertyRequests.email}) LIKE lower(${term}) OR
          lower(${propertyRequests.phone}) LIKE lower(${term}) OR
          lower(${propertyRequests.location}) LIKE lower(${term}) OR
          lower(${propertyRequests.category}) LIKE lower(${term}) OR
          lower(COALESCE(${propertyRequests.description}, '')) LIKE lower(${term})
        )`
      );
    }

    if (requestStage && requestStage !== "all") {
      if (requestStage === "submitted") {
        filters.push(eq(propertyRequests.review_status, "pending"));
      } else if (
        requestStage === "pending" ||
        requestStage === "approved" ||
        requestStage === "declined"
      ) {
        filters.push(eq(propertyRequests.review_status, requestStage));
      }
    }

    if (requestType === "buy" || requestType === "rent") {
      filters.push(eq(propertyRequests.type, requestType));
    }

    if (requestLocation) {
      const locationPattern = `%${requestLocation}%`;
      filters.push(sql`lower(${propertyRequests.location}) LIKE lower(${locationPattern})`);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      if (!Number.isNaN(from.getTime())) {
        filters.push(gte(propertyRequests.created_at, from));
      }
    }

    if (toDate) {
      const to = new Date(toDate);
      if (!Number.isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        filters.push(lte(propertyRequests.created_at, to));
      }
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db
      .select()
      .from(propertyRequests)
      .where(whereClause)
      .orderBy(desc(propertyRequests.created_at));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching property requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch property requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPropertyRequestSchema.parse(body);
    const validated = {
      ...parsed,
      type: parsed.type === "sale" ? "buy" : parsed.type,
      review_status: "pending" as const,
    };

    const [created] = await db
      .insert(propertyRequests)
      .values(validated)
      .returning();

    try {
      await db.insert(contacts).values({
        name: created.name,
        email: created.email,
        phone: created.phone,
        message: buildContactMessage(created),
        property_id: null,
      });
    } catch (contactError) {
      console.error("Failed to create contact notification for property request:", contactError);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }
    console.error("Error creating property request:", error);
    return NextResponse.json(
      { error: "Failed to create property request" },
      { status: 500 }
    );
  }
}
