import type { Property, PropertyImage } from "@/types";
import { LOCALES } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is required");
}

export function generatePropertyJsonLd(
  property: Property & { images?: PropertyImage[] },
  locale: string
) {
  const titleKey = `title_${locale}` as keyof Property;
  const descKey = `description_${locale}` as keyof Property;
  const title = (property[titleKey] as string) || property.title_en;
  const description = (property[descKey] as string) || property.description_en;
  const primaryImage = property.images?.find((img) => img.is_primary);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    description: description,
    url: `${BASE_URL}/${locale}/properties/${property.id}`,
    image: primaryImage ? `${BASE_URL}${primaryImage.url}` : undefined,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability:
        property.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    ...(property.latitude &&
      property.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: property.latitude,
          longitude: property.longitude,
        },
      }),
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.surface_area,
      unitCode: "MTK",
    },
    numberOfRooms: property.rooms,
    numberOfBathroomsTotal: property.bathrooms,
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "NovaBuildings",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "North Macedonia's leading real estate platform for property sales and rentals.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Skopje",
      addressCountry: "MK",
    },
    telephone: "+389 2 123 456",
    email: "info@novabuildings.com",
  };
}

export function generateHreflangLinks(
  path: string
): { locale: string; url: string }[] {
  return LOCALES.map((locale) => ({
    locale,
    url: `${BASE_URL}/${locale}${path}`,
  }));
}
