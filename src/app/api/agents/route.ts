import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  avatar: z.string().nullable().optional(),
  bio_al: z.string().nullable().optional(),
  bio_en: z.string().nullable().optional(),
  bio_de: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const data = await db
      .select()
      .from(agents)
      .orderBy(desc(agents.created_at));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
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
    const validated = createAgentSchema.parse(body);

    const [created] = await db.insert(agents).values(validated).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
