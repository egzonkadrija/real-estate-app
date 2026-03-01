import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents, properties } from "@/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, validationErrorResponse } from "@/lib/apiRouteUtils";

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  avatar: z.string().nullable().optional(),
  bio_al: z.string().nullable().optional(),
  bio_en: z.string().nullable().optional(),
  bio_de: z.string().nullable().optional(),
});

type AgentPropertyItem = {
  id: number;
  title: string;
  status:
    | "active"
    | "pending"
    | "sold"
    | "rented";
  type: "sale" | "rent";
  price: number | null;
  rentMonthsAccrued: number;
  revenueContribution: number;
};

type AgentListItem = {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  bio_al: string | null;
  bio_en: string | null;
  bio_de: string | null;
  totalProperties: number;
  soldProperties: number;
  soldRevenue: number;
  properties: AgentPropertyItem[];
};

function normalizePropertyStatus(
  status: AgentPropertyItem["status"],
  type: AgentPropertyItem["type"]
): AgentPropertyItem["status"] {
  if (type === "rent" && status === "sold") return "rented";
  if (type === "sale" && status === "rented") return "sold";
  return status;
}

function getAccruedRentMonths(rentedSince: Date, now: Date): number {
  const rentedYear = rentedSince.getUTCFullYear();
  const rentedMonth = rentedSince.getUTCMonth();
  let firstPaymentYear = rentedYear;
  let firstPaymentMonth = rentedMonth + 1;
  if (firstPaymentMonth > 11) {
    firstPaymentMonth = 0;
    firstPaymentYear += 1;
  }

  const currentPaymentYear = now.getUTCFullYear();
  const currentPaymentMonth = now.getUTCMonth();
  const firstPaymentIndex = firstPaymentYear * 12 + firstPaymentMonth;
  const currentPaymentIndex = currentPaymentYear * 12 + currentPaymentMonth;

  if (firstPaymentIndex > currentPaymentIndex) {
    return 0;
  }

  return currentPaymentIndex - firstPaymentIndex + 1;
}

export async function GET() {
  try {
    const agentsWithStats = await db
      .select({
        id: agents.id,
        name: agents.name,
        email: agents.email,
        phone: agents.phone,
        avatar: agents.avatar,
        bio_al: agents.bio_al,
        bio_en: agents.bio_en,
        bio_de: agents.bio_de,
        totalProperties: count(properties.id).as("totalProperties"),
        soldProperties: count(
          sql`CASE WHEN ${properties.status} = 'sold' AND ${properties.type} = 'sale' THEN 1 END`
        ).as("soldProperties"),
        soldRevenue: sql<number | null>`0`.as("soldRevenue"),
      })
      .from(agents)
      .leftJoin(properties, eq(properties.agent_id, agents.id))
      .groupBy(agents.id)
      .orderBy(desc(agents.created_at));

    const propertiesRows = await db
      .select({
        agent_id: properties.agent_id,
        id: properties.id,
        title_en: properties.title_en,
        status: properties.status,
        type: properties.type,
        price: properties.price,
        created_at: properties.created_at,
        updated_at: properties.updated_at,
      })
      .from(properties)
      .orderBy(desc(properties.created_at));

    const propertiesByAgent = new Map<number, AgentPropertyItem[]>();
    const revenueByAgent = new Map<number, number>();
    const now = new Date();

    for (const property of propertiesRows) {
      if (!property.agent_id) {
        continue;
      }

      const list = propertiesByAgent.get(property.agent_id) ?? [];
      const normalizedStatus = normalizePropertyStatus(property.status, property.type);
      let rentMonthsAccrued = 0;
      if (normalizedStatus === "rented") {
        const monthsFromUpdated = getAccruedRentMonths(property.updated_at, now);
        if (monthsFromUpdated > 0) {
          rentMonthsAccrued = monthsFromUpdated;
        } else {
          // Fallback for legacy records where updated_at was bumped by edits after renting.
          const monthsFromCreated = getAccruedRentMonths(property.created_at, now);
          if (monthsFromCreated > 0) {
            rentMonthsAccrued = 1;
          }
        }
      }
      const basePrice = property.price ?? 0;
      const revenueContribution =
        normalizedStatus === "sold" && property.type === "sale"
          ? basePrice
          : normalizedStatus === "rented" && property.type === "rent"
            ? basePrice * rentMonthsAccrued
            : 0;

      list.push({
        id: property.id,
        title: property.title_en,
        status: normalizedStatus,
        type: property.type,
        price: property.price,
        rentMonthsAccrued,
        revenueContribution,
      });
      propertiesByAgent.set(property.agent_id, list);
      revenueByAgent.set(
        property.agent_id,
        (revenueByAgent.get(property.agent_id) ?? 0) + revenueContribution
      );
    }

    const data: AgentListItem[] = agentsWithStats.map((agent) => {
      const properties = propertiesByAgent.get(agent.id) ?? [];
      return {
        ...agent,
        totalProperties: Number(agent.totalProperties),
        soldProperties: Number(agent.soldProperties),
        soldRevenue: revenueByAgent.get(agent.id) ?? 0,
        properties,
      };
    });

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
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const body = await request.json();
    const validated = createAgentSchema.parse(body);

    const [created] = await db.insert(agents).values(validated).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
