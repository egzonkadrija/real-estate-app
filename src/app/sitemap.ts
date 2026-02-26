import type { MetadataRoute } from "next";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["mk", "al", "en", "de", "tr"];

  // Static pages
  const staticPages = [
    "",
    "/properties",
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/submit-property",
    "/request-property",
    "/favorites",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? ("daily" as const) : ("weekly" as const),
      priority: page === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
        ),
      },
    }))
  );

  // Dynamic property pages
  let propertyEntries: MetadataRoute.Sitemap = [];
  try {
    const allProperties = await db
      .select({ id: properties.id, updated_at: properties.updated_at })
      .from(properties)
      .where(eq(properties.status, "active"));

    propertyEntries = allProperties.flatMap((prop) =>
      locales.map((locale) => ({
        url: `${BASE_URL}/${locale}/properties/${prop.id}`,
        lastModified: prop.updated_at,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/properties/${prop.id}`])
          ),
        },
      }))
    );
  } catch {
    // DB may not be available during build
  }

  return [...staticEntries, ...propertyEntries];
}
