import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";

interface RevenueProperty {
  id: number;
  title: string;
  category: "house" | "apartment" | "office" | "land" | "store" | "warehouse" | "penthouse" | "object";
  type: "sale" | "rent";
  status: "active" | "pending" | "sold" | "rented";
  price: number;
  updated_at: Date | null;
}

interface MonthlyRevenueRow {
  month: string;
  monthLabel: string;
  apartment: number;
  office: number;
  total: number;
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
  });
}

function getMonthKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

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

    const statusFilter = ["sold", "rented"] as const;

    const rows = await db
      .select({
        id: properties.id,
        title: properties.title_en,
        category: properties.category,
        type: properties.type,
        status: properties.status,
        price: properties.price,
        updated_at: properties.updated_at,
      })
      .from(properties)
      .where(inArray(properties.status, statusFilter));

    const soldRevenue = rows.reduce((sum, row) => {
      if (row.status !== "sold") return sum;
      return sum + (row.price ?? 0);
    }, 0);

    const soldProperties = rows
      .filter((row): row is RevenueProperty => row.status === "sold" && row.price !== null)
      .map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        type: row.type,
        price: row.price,
        status: row.status,
        updated_at: row.updated_at,
      }));

    const monthlyMap = new Map<string, MonthlyRevenueRow>();
    for (const row of rows) {
      if (row.status !== "rented") continue;
      if (row.category !== "apartment" && row.category !== "office") continue;
      const date = row.updated_at ? new Date(row.updated_at) : null;
      if (!date || Number.isNaN(date.getTime())) continue;
      if (row.price === null) continue;

      const month = getMonthKey(date);
      const existing = monthlyMap.get(month);
      const apartment = existing?.apartment ?? 0;
      const office = existing?.office ?? 0;
      if (row.category === "apartment") {
        monthlyMap.set(month, {
          month,
          monthLabel: formatMonthLabel(date),
          apartment: apartment + row.price,
          office: existing?.office ?? 0,
          total: (existing?.total ?? 0) + row.price,
        });
      } else {
        monthlyMap.set(month, {
          month,
          monthLabel: formatMonthLabel(date),
          apartment: existing?.apartment ?? 0,
          office: office + row.price,
          total: (existing?.total ?? 0) + row.price,
        });
      }
    }

    const monthlyRentedRevenue: MonthlyRevenueRow[] = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return NextResponse.json({
      soldRevenue,
      soldProperties,
      monthlyRentedRevenue,
    });
  } catch (error) {
    console.error("Error building revenue metrics:", error);
    return NextResponse.json(
      { error: "Failed to load revenue metrics" },
      { status: 500 }
    );
  }
}
