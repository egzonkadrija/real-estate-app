import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { propertyRequests } from "@/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

const createPropertyRequestSchema = z.object({
  type: z.enum(["buy", "rent"]),
  category: z.string().min(1, "Category is required"),
  min_price: z.number().int().nullable().optional(),
  max_price: z.number().int().nullable().optional(),
  location: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await db
      .select()
      .from(propertyRequests)
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
    const validated = createPropertyRequestSchema.parse(body);

    const [created] = await db
      .insert(propertyRequests)
      .values(validated)
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating property request:", error);
    return NextResponse.json(
      { error: "Failed to create property request" },
      { status: 500 }
    );
  }
}
