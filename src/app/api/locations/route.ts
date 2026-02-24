import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const parentId = searchParams.get("parent_id");

    const conditions = [];

    if (type) {
      conditions.push(eq(locations.type, type as "state" | "city" | "neighborhood"));
    }
    if (parentId) {
      conditions.push(eq(locations.parent_id, Number(parentId)));
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
