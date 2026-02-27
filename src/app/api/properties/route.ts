import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, propertyImages, locations } from "@/db/schema";
import { eq, desc, and, gte, lte, sql, count, inArray } from "drizzle-orm";
import { z } from "zod";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

const createPropertySchema = z.object({
  title_al: z.string().min(1),
  title_en: z.string().min(1),
  title_de: z.string().min(1),
  description_al: z.string().default(""),
  description_en: z.string().default(""),
  description_de: z.string().default(""),
  type: z.enum(["sale", "rent"]),
  category: z.enum(["house", "apartment", "office", "land", "store", "warehouse", "penthouse", "object"]),
  price: z.number().positive(),
  currency: z.string().default("EUR"),
  surface_area: z.number().positive(),
  rooms: z.number().int().nullable().optional(),
  bathrooms: z.number().int().nullable().optional(),
  floor: z.number().int().nullable().optional(),
  year_built: z.number().int().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  location_id: z.number().int(),
  agent_id: z.number().int(),
  featured: z.boolean().default(false),
  status: z.enum(["active", "pending", "sold", "rented"]).default("active"),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string().optional(),
    sort_order: z.number().default(0),
    is_primary: z.boolean().default(false),
  })).optional(),
});

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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = [];

    if (ids) {
      const idList = ids.split(",").map(Number).filter((n) => !isNaN(n));
      if (idList.length > 0) {
        conditions.push(
          sql`${properties.id} IN (${sql.join(
            idList.map((id) => sql`${id}`),
            sql`, `
          )})`
        );
      }
    }
    if (q?.trim()) {
      const term = `%${q.trim()}%`;
      conditions.push(
        sql`(${properties.title_al} ILIKE ${term} OR ${properties.title_en} ILIKE ${term} OR ${properties.title_de} ILIKE ${term})`
      );
    }
    if (type) {
      conditions.push(eq(properties.type, type as "sale" | "rent"));
    }
    if (category) {
      conditions.push(eq(properties.category, category as "house" | "apartment" | "office" | "land" | "store" | "warehouse" | "penthouse" | "object"));
    }
    if (minPrice) {
      conditions.push(gte(properties.price, Number(minPrice)));
    }
    if (maxPrice) {
      conditions.push(lte(properties.price, Number(maxPrice)));
    }
    if (minArea) {
      conditions.push(gte(properties.surface_area, Number(minArea)));
    }
    if (maxArea) {
      conditions.push(lte(properties.surface_area, Number(maxArea)));
    }
    if (locationId) {
      conditions.push(eq(properties.location_id, Number(locationId)));
    }
    if (rooms) {
      conditions.push(gte(properties.rooms, Number(rooms)));
    }
    if (featured === "true") {
      conditions.push(eq(properties.featured, true));
    }
    if (status) {
      const allowedStatuses = ["active", "pending", "sold", "rented"] as const;
      const normalizedStatuses = status
        .split(",")
        .map((item) => item.trim())
        .filter((item): item is typeof allowedStatuses[number] =>
          (allowedStatuses as readonly string[]).includes(item)
        );

      if (normalizedStatuses.length === 1) {
        conditions.push(eq(properties.status, normalizedStatuses[0]));
      } else if (normalizedStatuses.length > 1) {
        conditions.push(
          inArray(
            properties.status,
            normalizedStatuses as (
              | "active"
              | "pending"
              | "sold"
              | "rented"
            )[]
          )
        );
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
        .where(
          sql`${propertyImages.property_id} IN (${sql.join(
            propertyIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        );
    }

    const result = data.map((row) => ({
      ...row.properties,
      location: row.locations,
      images: images.filter((img) => img.property_id === row.properties.id),
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
    const token = getTokenFromHeader(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { images: imageData, ...propertyData } = createPropertySchema.parse(body);

    const [created] = await db.insert(properties).values(propertyData).returning();

    if (imageData && imageData.length > 0) {
      await db.insert(propertyImages).values(
        imageData.map((img) => ({
          property_id: created.id,
          url: img.url,
          alt: img.alt || null,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
        }))
      );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
