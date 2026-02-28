import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { eq, asc, and, type SQL } from "drizzle-orm";
import { z } from "zod";

const locationTypeSchema = z.enum(["state", "city", "neighborhood"]);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const parentId = searchParams.get("parent_id");

    const conditions: SQL<unknown>[] = [];

    if (type) {
      const parsedType = locationTypeSchema.safeParse(type);
      if (parsedType.success) {
        conditions.push(eq(locations.type, parsedType.data));
      }
    }
    if (parentId) {
      const parsedParentId = Number(parentId);
      if (Number.isInteger(parsedParentId)) {
        conditions.push(eq(locations.parent_id, parsedParentId));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(locations)
      .where(whereClause)
      .orderBy(asc(locations.name_en));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
