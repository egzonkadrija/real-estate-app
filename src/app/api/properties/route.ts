import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, propertyImages, locations, agents } from "@/db/schema";
import {
  eq,
  desc,
  and,
  gte,
  lte,
  sql,
  count,
  inArray,
  type SQL,
} from "drizzle-orm";
import { z } from "zod";
import { requireAuth, validationErrorResponse } from "@/lib/apiRouteUtils";
import { normalizeImageUrl } from "@/lib/utils";
import {
  createPropertySchema,
  parsePropertyStatuses,
  propertyCategorySchema,
  propertyTypeSchema,
} from "@/lib/propertyValidation";

function parseIntegerParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return undefined;
  return parsed;
}

function parseNumberParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const ids = searchParams.get("ids");
    const q = searchParams.get("q");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minArea = searchParams.get("minArea");
    const maxArea = searchParams.get("maxArea");
    const locationId = searchParams.get("locationId");
    const rooms = searchParams.get("rooms");
    const page = Math.max(1, parseIntegerParam(searchParams.get("page")) ?? 1);
    const limit = Math.max(
      1,
      Math.min(100, parseIntegerParam(searchParams.get("limit")) ?? 12)
    );
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const agentId = searchParams.get("agentId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const conditions: SQL<unknown>[] = [];

    if (ids) {
      const idList = ids
        .split(",")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value));
      if (idList.length > 0) {
        conditions.push(inArray(properties.id, idList));
      }
    }

    if (q?.trim()) {
      const term = `%${q.trim()}%`;
      conditions.push(
        sql`(${properties.title_al} ILIKE ${term} OR ${properties.title_en} ILIKE ${term} OR ${properties.title_de} ILIKE ${term})`
      );
    }

    if (type) {
      const parsedType = propertyTypeSchema.safeParse(type);
      if (parsedType.success) {
        conditions.push(eq(properties.type, parsedType.data));
      }
    }

    if (category) {
      const parsedCategory = propertyCategorySchema.safeParse(category);
      if (parsedCategory.success) {
        conditions.push(eq(properties.category, parsedCategory.data));
      }
    }

    const minPriceValue = parseNumberParam(minPrice);
    if (minPriceValue !== undefined) {
      conditions.push(gte(properties.price, minPriceValue));
    }

    const maxPriceValue = parseNumberParam(maxPrice);
    if (maxPriceValue !== undefined) {
      conditions.push(lte(properties.price, maxPriceValue));
    }

    const minAreaValue = parseNumberParam(minArea);
    if (minAreaValue !== undefined) {
      conditions.push(gte(properties.surface_area, minAreaValue));
    }

    const maxAreaValue = parseNumberParam(maxArea);
    if (maxAreaValue !== undefined) {
      conditions.push(lte(properties.surface_area, maxAreaValue));
    }

    const locationIdValue = parseIntegerParam(locationId);
    if (locationIdValue !== undefined) {
      conditions.push(eq(properties.location_id, locationIdValue));
    }

    const roomsValue = parseIntegerParam(rooms);
    if (roomsValue !== undefined) {
      conditions.push(gte(properties.rooms, roomsValue));
    }

    if (featured === "true") {
      conditions.push(eq(properties.featured, true));
    }

    if (status) {
      const normalizedStatuses = parsePropertyStatuses(status);

      if (normalizedStatuses.length === 1) {
        conditions.push(eq(properties.status, normalizedStatuses[0]));
      } else if (normalizedStatuses.length > 1) {
        conditions.push(inArray(properties.status, normalizedStatuses));
      }
    }

    if (agentId) {
      const resolvedAgentId = parseIntegerParam(agentId);
      if (resolvedAgentId !== undefined) {
        conditions.push(eq(properties.agent_id, resolvedAgentId));
      }
    }

    if (fromDate) {
      const parsedFrom = new Date(fromDate);
      if (!Number.isNaN(parsedFrom.getTime())) {
        conditions.push(gte(properties.created_at, parsedFrom));
      }
    }

    if (toDate) {
      const parsedTo = new Date(toDate);
      if (!Number.isNaN(parsedTo.getTime())) {
        parsedTo.setHours(23, 59, 59, 999);
        conditions.push(lte(properties.created_at, parsedTo));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    const [totalResult] = await db
      .select({ total: count() })
      .from(properties)
      .where(whereClause);

    const total = totalResult.total;

    const data = await db
      .select()
      .from(properties)
      .leftJoin(locations, eq(properties.location_id, locations.id))
      .leftJoin(agents, eq(properties.agent_id, agents.id))
      .where(whereClause)
      .orderBy(desc(properties.created_at))
      .limit(limit)
      .offset(offset);

    const propertyIds = data.map((row) => row.properties.id);

    let images: (typeof propertyImages.$inferSelect)[] = [];
    if (propertyIds.length > 0) {
      images = await db
        .select()
        .from(propertyImages)
        .where(inArray(propertyImages.property_id, propertyIds));
    }

    const result = data.map((row) => ({
      ...row.properties,
      location: row.locations,
      agent: row.agents
        ? {
            id: row.agents.id,
            name: row.agents.name,
          }
        : null,
      images: images
        .filter((img) => img.property_id === row.properties.id)
        .map((img) => ({
          ...img,
          url: normalizeImageUrl(img.url),
        })),
    }));

    return NextResponse.json({
      data: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const body = await request.json();
    const { images: imageData, ...propertyData } = createPropertySchema.parse(body);

    const [created] = await db.insert(properties).values(propertyData).returning();

    if (imageData && imageData.length > 0) {
      await db.insert(propertyImages).values(
        imageData.map((img) => ({
          property_id: created.id,
          url: normalizeImageUrl(img.url),
          alt: img.alt || null,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
        }))
      );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
