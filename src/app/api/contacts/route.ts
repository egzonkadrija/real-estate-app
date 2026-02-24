import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  message: z.string().min(1, "Message is required"),
  property_id: z.number().int().nullable().optional(),
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

    const searchParams = request.nextUrl.searchParams;
    const isRead = searchParams.get("is_read");

    const whereClause =
      isRead === "true"
        ? eq(contacts.is_read, true)
        : isRead === "false"
          ? eq(contacts.is_read, false)
          : undefined;

    const data = await db
      .select()
      .from(contacts)
      .where(whereClause)
      .orderBy(desc(contacts.created_at));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createContactSchema.parse(body);

    const [created] = await db
      .insert(contacts)
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
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
