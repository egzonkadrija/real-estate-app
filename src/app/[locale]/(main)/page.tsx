import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { properties, propertyImages, locations } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Search,
  Home,
  Building2,
  Briefcase,
  Mountain,
  Store,
  Warehouse,
  ArrowRight,
  Send,
} from "lucide-react";
import { FeaturedProperties } from "./FeaturedProperties";

const CATEGORY_ICONS = {
  house: Home,
  apartment: Building2,
  office: Briefcase,
  land: Mountain,
  store: Store,
  warehouse: Warehouse,
} as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  // Fetch featured properties with images and locations
  const featuredProperties = await db.query.properties.findMany({
    where: and(
      eq(properties.featured, true),
      eq(properties.status, "active")
    ),
    with: {
      images: true,
      location: true,
    },
    orderBy: [desc(properties.created_at)],
    limit: 4,
  });

  const categories = [
    "house",
    "apartment",
    "office",
    "land",
    "store",
    "warehouse",
  ] as const;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-4 py-24 text-white">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mb-8 text-lg text-blue-100 sm:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mx-auto flex max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Link href="/properties" className="block">
                <div className="w-full cursor-pointer rounded-lg bg-white py-3.5 pl-10 pr-4 text-left text-sm text-gray-400">
                  {t("hero.searchPlaceholder")}
                </div>
              </Link>
            </div>
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600">
              <Link href="/properties">
                {t("common.search")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("property.featured")}
          </h2>
          <Button asChild variant="outline">
            <Link href="/properties" className="flex items-center gap-2">
              {t("common.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <FeaturedProperties
          properties={JSON.parse(JSON.stringify(featuredProperties))}
        />
      </section>

      {/* Category Shortcuts */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("filters.category")}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              return (
                <Link
                  key={category}
                  href={`/properties?category=${category}`}
                >
                  <Card className="group cursor-pointer transition-all hover:border-blue-300 hover:shadow-md">
                    <CardContent className="flex flex-col items-center gap-3 p-6">
                      <div className="rounded-full bg-blue-50 p-4 transition-colors group-hover:bg-blue-100">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {t(`property.${category}`)}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center text-white sm:p-12">
          <Send className="mx-auto mb-4 h-10 w-10" />
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
            {t("form.submitProperty")}
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-blue-100">
            {t("footer.description")}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100"
            >
              <Link href="/submit-property">
                {t("common.submitProperty")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/request-property">
                {t("common.requestProperty")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
