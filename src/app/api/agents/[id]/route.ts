import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents, properties } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { z } from "zod";
import {
  parseNumericId,
  requireAuth,
  validationErrorResponse,
} from "@/lib/apiRouteUtils";

const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.string().nullable().optional(),
  bio_al: z.string().nullable().optional(),
  bio_en: z.string().nullable().optional(),
  bio_de: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const parsedId = await parseNumericId(params, "Invalid agent ID");
    if (parsedId instanceof NextResponse) return parsedId;
    const agentId = parsedId;

    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    const [propertiesCount] = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.agent_id, agentId));

    return NextResponse.json({
      ...agent,
      propertiesCount: propertiesCount.count,
    });
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
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

    const parsedId = await parseNumericId(params, "Invalid agent ID");
    if (parsedId instanceof NextResponse) return parsedId;
    const agentId = parsedId;

    const body = await request.json();
    const validated = updateAgentSchema.parse(body);

    const [updated] = await db
      .update(agents)
      .set(validated)
      .where(eq(agents.id, agentId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
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

    const parsedId = await parseNumericId(params, "Invalid agent ID");
    if (parsedId instanceof NextResponse) return parsedId;
    const agentId = parsedId;

    const [deleted] = await db
      .delete(agents)
      .where(eq(agents.id, agentId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}
