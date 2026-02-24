import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLocalizedField, formatPrice, formatArea } from "@/lib/utils";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { AmenityBadge } from "@/components/property/AmenityBadge";
import { PropertyMap } from "@/components/property/PropertyMap";
import { ContactForm } from "@/components/forms/ContactForm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Maximize,
  BedDouble,
  Bath,
  Building,
  Calendar,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { MortgageCalculator } from "./MortgageCalculator";
import type { Metadata } from "next";

interface PropertyDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, parseInt(id, 10)),
  });

  if (!property) {
    return { title: "Property Not Found" };
  }

  const title = getLocalizedField(property, "title", locale);
  const description = getLocalizedField(property, "description", locale);

  return {
    title,
    description: description.substring(0, 160),
    openGraph: {
      title,
      description: description.substring(0, 160),
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale });

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, parseInt(id, 10)),
    with: {
      images: true,
      agent: true,
      location: true,
    },
  });

  if (!property) {
    notFound();
  }

  const title = getLocalizedField(property, "title", locale);
  const description = getLocalizedField(property, "description", locale);
  const locationName = property.location
    ? getLocalizedField(property.location, "name", locale)
    : "";
  const amenities = (property.amenities as string[]) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Gallery */}
          <PropertyGallery images={property.images || []} />

          {/* Title & Price */}
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={property.type === "sale" ? "default" : "success"}>
                {property.type === "sale"
                  ? t("property.forSale")
                  : t("property.forRent")}
              </Badge>
              <Badge variant="secondary">
                {t(`property.${property.category}`)}
              </Badge>
              <Badge variant="outline">
                {t(`property.status.${property.status}`)}
              </Badge>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {title}
            </h1>
            {locationName && (
              <p className="mb-3 text-sm text-gray-500">{locationName}</p>
            )}
            <p className="text-3xl font-bold text-blue-600">
              {formatPrice(property.price, property.currency)}
              {property.type === "rent" && (
                <span className="text-base font-normal text-gray-500">
                  /mo
                </span>
              )}
            </p>
          </div>

          {/* Details Grid */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("property.details")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Maximize className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t("property.area")}</p>
                    <p className="font-semibold">
                      {formatArea(property.surface_area)}
                    </p>
                  </div>
                </div>
                {property.rooms !== null && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <BedDouble className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("property.rooms")}
                      </p>
                      <p className="font-semibold">{property.rooms}</p>
                    </div>
                  </div>
                )}
                {property.bathrooms !== null && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <Bath className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("property.bathrooms")}
                      </p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                {property.floor !== null && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("property.floor")}
                      </p>
                      <p className="font-semibold">{property.floor}</p>
                    </div>
                  </div>
                )}
                {property.year_built !== null && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("property.yearBuilt")}
                      </p>
                      <p className="font-semibold">{property.year_built}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("property.description")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line leading-relaxed text-gray-700">
                {description}
              </p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {amenities.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("property.amenities")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <AmenityBadge key={amenity} amenity={amenity} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map */}
          {property.latitude && property.longitude && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("property.location")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-hidden rounded-lg">
                  <PropertyMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    title={title}
                    className="h-full w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mortgage Calculator */}
          {property.type === "sale" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("property.mortgage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MortgageCalculator price={property.price} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("property.contactAgent")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm propertyId={property.id} />
            </CardContent>
          </Card>

          {/* Agent Info */}
          {property.agent && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {property.agent.avatar ? (
                    <img
                      src={property.agent.avatar}
                      alt={property.agent.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-7 w-7 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {property.agent.name}
                    </h3>
                    <div className="mt-1 space-y-0.5">
                      <p className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Mail className="h-3.5 w-3.5" />
                        {property.agent.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Phone className="h-3.5 w-3.5" />
                        {property.agent.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
