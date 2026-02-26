import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getLocalizedField, formatPrice, formatArea } from "@/lib/utils";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { AmenityBadge } from "@/components/property/AmenityBadge";
import { PropertyMap } from "@/components/property/PropertyMap";
import { FloatingSidebar } from "@/components/property/FloatingSidebar";
import { ContactForm } from "@/components/forms/ContactForm";
import { ShareButton } from "@/components/property/ShareButton";
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
    const notFoundTitle = locale === "al"
      ? "Prona nuk u gjet"
      : locale === "mk"
      ? "Imotot ne e pronajden"
      : locale === "de"
      ? "Immobilie nicht gefunden"
      : locale === "tr"
      ? "Ilan bulunamadi"
      : "Property Not Found";
    return { title: notFoundTitle };
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ViberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.518 6.769.399 9.932c-.12 3.163-.276 9.1 5.597 10.786l.007.001-.004 2.462s-.039.993.617 1.196c.793.244 1.258-.51 2.015-1.326.415-.449.988-1.109 1.42-1.615 3.913.33 6.92-.423 7.265-.537.794-.263 5.285-.834 6.017-6.804.755-6.163-.362-10.055-2.332-11.805l-.002-.001C19.539.652 16.122-.066 11.398.002zM12.34 1.5c4.226-.049 7.173.478 8.486 1.63 1.635 1.456 2.676 4.907 2.013 10.31-.614 5.009-4.279 5.395-4.963 5.621-.285.095-2.89.744-6.276.497 0 0-2.486 2.997-3.262 3.782-.121.123-.266.178-.362.153-.134-.035-.17-.196-.169-.432l.025-4.108c-4.928-1.42-4.64-6.452-4.54-9.105.1-2.653.726-4.832 2.166-6.254 2.003-1.823 5.655-2.075 6.882-2.094zm-.15 2.69a.488.488 0 00-.488.5.49.49 0 00.498.488c1.08-.005 2.11.381 2.898 1.122.79.74 1.248 1.758 1.298 2.832a.49.49 0 00.507.472.49.49 0 00.472-.508c-.06-1.3-.622-2.53-1.581-3.428-.96-.9-2.208-1.403-3.52-1.478a.472.472 0 00-.083-.001zm-3.06.96c-.196-.012-.39.092-.535.327l-.634.95c-.26.382-.56.696-.58 1.137-.012.3.1.58.268.85l.04.066c.714 1.206 1.592 2.322 2.66 3.27l.039.035.035.039c.948 1.068 2.064 1.946 3.27 2.66l.066.04c.27.168.55.28.85.268.441-.02.755-.32 1.138-.58l.948-.634c.37-.248.476-.745.234-1.098l-1.314-1.942a.696.696 0 00-1.024-.16l-.727.545c-.094.071-.214.08-.318.025l-.022-.011a8.98 8.98 0 01-1.6-1.12 8.98 8.98 0 01-1.12-1.6l-.011-.022a.234.234 0 01.025-.318l.545-.727a.696.696 0 00-.16-1.024L9.652 5.29a.689.689 0 00-.521-.14zm3.458.85a.49.49 0 00-.455.518c.044.623.315 1.206.763 1.636.449.43 1.04.68 1.664.7a.487.487 0 00.506-.468.49.49 0 00-.468-.507 1.474 1.474 0 01-1.01-.426 1.47 1.47 0 01-.467-.997.488.488 0 00-.533-.455z" />
    </svg>
  );
}

function getPriceRating(pricePerSqm: number): { level: "cheap" | "average" | "expensive"; percentage: number } {
  // Rough market averages for North Macedonia (EUR/m²)
  if (pricePerSqm < 800) return { level: "cheap", percentage: 25 };
  if (pricePerSqm < 1500) return { level: "average", percentage: 55 };
  return { level: "expensive", percentage: 85 };
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

  const pricePerSqm = property.surface_area > 0
    ? Math.round(property.price / property.surface_area)
    : null;
  const priceRating = pricePerSqm ? getPriceRating(pricePerSqm) : null;

  const ratingLabelKey = priceRating
    ? priceRating.level === "cheap"
      ? "priceRatingCheap"
      : priceRating.level === "average"
      ? "priceRatingAverage"
      : "priceRatingExpensive"
    : null;

  const ratingColor = priceRating
    ? priceRating.level === "cheap"
      ? "bg-green-500"
      : priceRating.level === "average"
      ? "bg-amber-500"
      : "bg-red-500"
    : "";

  const agentPhone = property.agent?.phone?.replace(/\s+/g, "") || "";
  const moreInfoTitle = locale === "al"
    ? "Informacione te prones"
    : locale === "mk"
    ? "Informacii za imotot"
    : locale === "de"
    ? "Objektinformationen"
    : locale === "tr"
    ? "Mulk bilgileri"
    : "Property information";

  const infoRows: Array<{ label: string; value: string }> = [];
  const priceValue = `${formatPrice(property.price, property.currency)}${property.type === "rent" ? "/mo" : ""}`;
  infoRows.push({ label: t("property.price"), value: priceValue });
  infoRows.push({ label: t("property.area"), value: formatArea(property.surface_area) });
  infoRows.push({
    label: locale === "al" ? "Lloji" : locale === "mk" ? "Tip" : locale === "de" ? "Typ" : locale === "tr" ? "Tur" : "Type",
    value: property.type === "sale" ? t("property.forSale") : t("property.forRent"),
  });
  infoRows.push({
    label: locale === "al" ? "Statusi" : locale === "mk" ? "Status" : locale === "de" ? "Status" : locale === "tr" ? "Durum" : "Status",
    value: t(`property.status.${property.status}`),
  });

  if (locationName) {
    infoRows.push({ label: t("property.location"), value: locationName });
  }
  if (property.rooms !== null) {
    infoRows.push({ label: t("property.rooms"), value: String(property.rooms) });
  }
  if (property.bathrooms !== null) {
    infoRows.push({ label: t("property.bathrooms"), value: String(property.bathrooms) });
  }
  if (property.floor !== null) {
    infoRows.push({ label: t("property.floor"), value: String(property.floor) });
  }
  if (property.year_built !== null) {
    infoRows.push({ label: t("property.yearBuilt"), value: String(property.year_built) });
  }
  if (amenities.length > 0) {
    infoRows.push({
      label: t("property.amenities"),
      value: amenities
        .map((amenity) =>
          amenity
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        )
        .slice(0, 4)
        .join(", "),
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Gallery */}
          <PropertyGallery
            images={property.images || []}
            category={property.category}
            title={title}
          />

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
              <ShareButton
                title={title}
                label={t("property.shareProperty")}
              />
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

            {/* WhatsApp / Viber contact buttons */}
            {agentPhone && (
              <div className="mt-3 flex gap-2">
                <a
                  href={`https://wa.me/${agentPhone.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t("property.whatsapp")}
                </a>
                <a
                  href={`viber://chat?number=${encodeURIComponent(agentPhone)}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
                >
                  <ViberIcon className="h-4 w-4" />
                  {t("property.viber")}
                </a>
              </div>
            )}
          </div>

          {/* Price Rating Card */}
          {pricePerSqm && priceRating && ratingLabelKey && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("property.priceRating")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-500">
                      {t("property.pricePerSqm")}
                    </span>
                    <span className="text-lg font-bold">
                      {formatPrice(pricePerSqm, property.currency)}/m²
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${ratingColor} transition-all`}
                      style={{ width: `${priceRating.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {t(`property.${ratingLabelKey}`)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* More Info */}
          <Card id="more-info" className="mt-6 scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-lg">
                {moreInfoTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {infoRows.slice(0, 10).map((item) => (
                  <li
                    key={`${item.label}-${item.value}`}
                    className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 text-sm last:border-b-0 last:pb-0"
                  >
                    <span className="text-gray-500">{item.label}</span>
                    <span className="text-right font-medium text-gray-800">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

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
        <FloatingSidebar className="md:col-span-1">
          <div className="space-y-6 md:pr-1">
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
                      <Image
                        src={property.agent.avatar}
                        alt={property.agent.name}
                        width={56}
                        height={56}
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
                  {/* WhatsApp / Viber links in agent card */}
                  {agentPhone && (
                    <div className="mt-4 flex gap-2">
                      <a
                        href={`https://wa.me/${agentPhone.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        WhatsApp
                      </a>
                      <a
                        href={`viber://chat?number=${encodeURIComponent(agentPhone)}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
                      >
                        <ViberIcon className="h-4 w-4" />
                        Viber
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </FloatingSidebar>
      </div>
    </div>
  );
}

