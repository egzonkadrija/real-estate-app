import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseNumericId, requireAuth } from "@/lib/apiRouteUtils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const parsedId = await parseNumericId(params, "Invalid contact ID");
    if (parsedId instanceof NextResponse) return parsedId;
    const contactId = parsedId;

    const [updated] = await db
      .update(contacts)
      .set({ is_read: true })
      .where(eq(contacts.id, contactId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}
