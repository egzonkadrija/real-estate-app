import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  properties,
  propertyImages,
  locations,
  agents,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

const updatePropertySchema = z.object({
  title_al: z.string().min(1).optional(),
  title_en: z.string().min(1).optional(),
  title_de: z.string().min(1).optional(),
  description_al: z.string().optional(),
  description_en: z.string().optional(),
  description_de: z.string().optional(),
  type: z.enum(["sale", "rent"]).optional(),
  category: z.enum(["house", "apartment", "office", "land", "store", "warehouse"]).optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  surface_area: z.number().positive().optional(),
  rooms: z.number().int().nullable().optional(),
  bathrooms: z.number().int().nullable().optional(),
  floor: z.number().int().nullable().optional(),
  year_built: z.number().int().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  location_id: z.number().int().optional(),
  agent_id: z.number().int().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["active", "pending", "sold", "rented"]).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string().optional(),
    sort_order: z.number().default(0),
    is_primary: z.boolean().default(false),
  })).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const [result] = await db
      .select()
      .from(properties)
      .leftJoin(locations, eq(properties.location_id, locations.id))
      .leftJoin(agents, eq(properties.agent_id, agents.id))
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const images = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.property_id, propertyId));

    const property = {
      ...result.properties,
      location: result.locations,
      agent: result.agents,
      images,
    };

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { images: imageData, ...validated } = updatePropertySchema.parse(body);

    const [updated] = await db
      .update(properties)
      .set({ ...validated, updated_at: new Date() })
      .where(eq(properties.id, propertyId))
      .returning();

    if (imageData) {
      await db.delete(propertyImages).where(eq(propertyImages.property_id, propertyId));
      if (imageData.length > 0) {
        await db.insert(propertyImages).values(
          imageData.map((img) => ({
            property_id: propertyId,
            url: img.url,
            alt: img.alt || null,
            sort_order: img.sort_order,
            is_primary: img.is_primary,
          }))
        );
      }
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
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
    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    // Delete associated images first
    await db
      .delete(propertyImages)
      .where(eq(propertyImages.property_id, propertyId));

    const [deleted] = await db
      .delete(properties)
      .where(eq(properties.id, propertyId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
