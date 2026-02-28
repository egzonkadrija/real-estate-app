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
  price: number | null;
  updated_at: Date;
  created_at: Date;
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
        created_at: properties.created_at,
      })
      .from(properties)
      .where(inArray(properties.status, statusFilter));

    const toNumber = (value: number | null | undefined): number =>
      typeof value === "number" && Number.isFinite(value) ? value : 0;

    const isRentedRevenueEntry = (row: RevenueProperty) =>
      row.status === "rented" || (row.status === "sold" && row.type === "rent");
    const isSoldRevenueEntry = (row: RevenueProperty) =>
      row.status === "sold" && row.type === "sale";

    const soldRevenue = rows.reduce((sum, row) => {
      if (!isSoldRevenueEntry(row)) return sum;
      return sum + toNumber(row.price);
    }, 0);

    const rentedRevenue = rows.reduce((sum, row) => {
      if (!isRentedRevenueEntry(row)) return sum;
      return sum + toNumber(row.price);
    }, 0);

    const soldProperties = rows
      .filter(
        (row): row is RevenueProperty =>
          isSoldRevenueEntry(row) && row.price !== null
      )
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
      if (!isRentedRevenueEntry(row)) continue;
      const dateValue = row.updated_at ?? row.created_at;
      const date = dateValue ? new Date(dateValue) : null;
      if (!date || Number.isNaN(date.getTime())) continue;
      const price = toNumber(row.price);
      if (!price) continue;

      const month = getMonthKey(date);
      const existing = monthlyMap.get(month);
      monthlyMap.set(month, {
        month,
        monthLabel: formatMonthLabel(date),
        apartment: existing?.apartment ?? 0,
        office: existing?.office ?? 0,
        total: (existing?.total ?? 0) + price,
      });
    }

    const monthlyRentedRevenue: MonthlyRevenueRow[] = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return NextResponse.json({
      soldRevenue,
      rentedRevenue,
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
