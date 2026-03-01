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
import {
  parseNumericId,
  requireAuth,
  validationErrorResponse,
} from "@/lib/apiRouteUtils";
import { updatePropertySchema } from "@/lib/propertyValidation";
import { normalizeImageUrl } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const parsedId = await parseNumericId(params, "Invalid property ID");
    if (parsedId instanceof NextResponse) return parsedId;
    const propertyId = parsedId;

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
      images: images.map((img) => ({
        ...img,
        url: normalizeImageUrl(img.url),
      })),
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
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const parsedId = await parseNumericId(params, "Invalid property ID");
    if (parsedId instanceof NextResponse) return parsedId;
    const propertyId = parsedId;

    const body = await request.json();
    const { images: imageData, ...validated } = updatePropertySchema.parse(body);
    const [existingProperty] = await db
      .select({
        type: properties.type,
        status: properties.status,
        updated_at: properties.updated_at,
      })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const resolvedType = validated.type ?? existingProperty.type;
    const normalizedStatus =
      validated.status === "sold" && resolvedType === "rent"
        ? "rented"
        : validated.status;
    const resolvedStatus = normalizedStatus ?? existingProperty.status;
    const nextUpdatedAt =
      existingProperty.status === "rented" && resolvedStatus === "rented"
        ? existingProperty.updated_at
        : new Date();

    const [updated] = await db
      .update(properties)
      .set({ ...validated, status: normalizedStatus, updated_at: nextUpdatedAt })
      .where(eq(properties.id, propertyId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (imageData) {
      await db.delete(propertyImages).where(eq(propertyImages.property_id, propertyId));
      if (imageData.length > 0) {
        await db.insert(propertyImages).values(
          imageData.map((img) => ({
            property_id: propertyId,
            url: normalizeImageUrl(img.url),
            alt: img.alt || null,
            sort_order: img.sort_order,
            is_primary: img.is_primary,
          }))
        );
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
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
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const parsedId = await parseNumericId(params, "Invalid property ID");
    if (parsedId instanceof NextResponse) return parsedId;
    const propertyId = parsedId;

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
