import { getTranslations } from "next-intl/server";
import { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send } from "lucide-react";
import { PropertyCarousel } from "@/components/home/PropertyCarousel";
import { FeaturedProperties } from "./FeaturedProperties";
import { HeroCTAActions } from "@/components/home/HeroCTAActions";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  let featuredProperties: Awaited<ReturnType<typeof db.query.properties.findMany>> = [];
  let exclusiveProperties: Awaited<ReturnType<typeof db.query.properties.findMany>> = [];
  let latestProperties: Awaited<ReturnType<typeof db.query.properties.findMany>> = [];

  try {
    // Fetch featured, exclusive (featured+sale), and latest properties in parallel
    [featuredProperties, exclusiveProperties, latestProperties] = await Promise.all([
      db.query.properties.findMany({
        where: and(
          eq(properties.featured, true),
          eq(properties.status, "active")
        ),
        with: {
          images: true,
          location: true,
        },
        orderBy: [desc(properties.created_at)],
        limit: 12,
      }),
      db.query.properties.findMany({
        where: and(
          eq(properties.featured, true),
          eq(properties.type, "sale"),
          eq(properties.status, "active")
        ),
        with: {
          images: true,
          location: true,
        },
        orderBy: [desc(properties.created_at)],
        limit: 8,
      }),
      db.query.properties.findMany({
        where: eq(properties.status, "active"),
        with: {
          images: true,
          location: true,
        },
        orderBy: [desc(properties.created_at)],
        limit: 8,
      }),
    ]);
  } catch {
    // Keep homepage render resilient when DB is temporarily unavailable.
  }

  return (
    <div>
      {/* Featured Properties Slide Bar */}
      {featuredProperties.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 pt-8 pb-4">
          <PropertyCarousel
            properties={JSON.parse(JSON.stringify(featuredProperties))}
            title={t("property.featured")}
          />
        </section>
      )}

      {/* Exclusive Properties Section */}
      {exclusiveProperties.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold leading-tight text-gray-900 sm:text-3xl">
              {t("property.exclusiveProperties")}
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/properties?featured=true&type=sale" className="flex items-center gap-2">
                {t("common.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeaturedProperties
            properties={JSON.parse(JSON.stringify(exclusiveProperties))}
          />
        </section>
      )}

      {/* Other Properties Grid */}
      <section className="mx-auto max-w-[1440px] px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold leading-tight text-gray-900 sm:text-3xl">
              {t("property.otherProperties")}
            </h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/properties" className="flex items-center gap-2">
              {t("common.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <FeaturedProperties
          properties={JSON.parse(JSON.stringify(latestProperties))}
        />
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-[1440px] px-4 py-16">
          <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-left text-white sm:p-12">
            <div className="mb-4 flex items-center gap-3">
              <Send className="h-10 w-10 text-amber-400" />
              <HeroCTAActions
                submitLabel={t("common.submitProperty")}
                requestLabel={t("common.requestProperty")}
                showSubmitRequest={false}
                compact
              />
            </div>
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
              {t("form.submitProperty")}
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-gray-300">
              {t("footer.description")}
            </p>
          <HeroCTAActions
            submitLabel={t("common.submitProperty")}
            requestLabel={t("common.requestProperty")}
          />
        </div>
      </section>
    </div>
  );
}
