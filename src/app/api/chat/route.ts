import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { properties } from "@/db/schema";
import alMessages from "@/messages/al.json";
import enMessages from "@/messages/en.json";
import deMessages from "@/messages/de.json";
import trMessages from "@/messages/tr.json";
import mkMessages from "@/messages/mk.json";
import { LOCALES, type Locale } from "@/lib/constants";
import { isSupportedLocale } from "@/lib/locales";

type SupportedLocale = Locale;

const bodySchema = z.object({
  message: z.string().trim().min(1).max(500),
  locale: z.enum(LOCALES).optional(),
});

const CHAT_TEXTS: Record<SupportedLocale, Record<string, string>> = {
  mk: mkMessages.chat as Record<string, string>,
  al: alMessages.chat as Record<string, string>,
  en: enMessages.chat as Record<string, string>,
  de: deMessages.chat as Record<string, string>,
  tr: trMessages.chat as Record<string, string>,
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeLocale(locale?: string): SupportedLocale {
  if (locale && isSupportedLocale(locale)) {
    return locale;
  }
  return "en";
}

function parseType(text: string): "sale" | "rent" | undefined {
  const rent = /\b(rent|rental|qira|miete|kiralik|kira|najam)\b/.test(text);
  const sale = /\b(sale|buy|purchase|sell|shitje|blerje|kaufen|verkauf|satilik|satis|proda)\b/.test(text);
  if (rent && !sale) return "rent";
  if (sale && !rent) return "sale";
  return undefined;
}

function parseCategory(
  text: string
): "house" | "apartment" | "office" | "land" | "store" | "warehouse" | "penthouse" | "object" | undefined {
  if (/\b(apartment|apartman|banese|banesa|stan|wohnung|daire)\b/.test(text)) return "apartment";
  if (/\b(house|home|shtepi|haus|ev|villa)\b/.test(text)) return "house";
  if (/\b(office|zyre|zyra|buro|buero|ofis)\b/.test(text)) return "office";
  if (/\b(land|toke|troje|grundstuck|grundstueck|arsa)\b/.test(text)) return "land";
  if (/\b(store|shop|lokal|dyqan|geschaft|geschaeft|dukkan)\b/.test(text)) return "store";
  if (/\b(warehouse|depo|lager|magaza)\b/.test(text)) return "warehouse";
  if (/\b(penthouse)\b/.test(text)) return "penthouse";
  if (/\b(object|objekt)\b/.test(text)) return "object";
  return undefined;
}

function parseRooms(text: string): number | undefined {
  const direct = text.match(/(\d+)\s*(?:rooms?|dhoma|zimmer|oda|bed)\b/);
  const reverse = text.match(/\b(?:rooms?|dhoma|zimmer|oda|bed)\s*(\d+)/);
  const value = direct?.[1] ?? reverse?.[1];
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 20) return undefined;
  return parsed;
}

function parseArea(text: string): number | undefined {
  const areaMatch = text.match(/(\d{2,5})\s*(?:m2|m²|sqm|m\^2)\b/);
  if (!areaMatch) return undefined;
  const parsed = Number(areaMatch[1]);
  if (!Number.isFinite(parsed) || parsed < 15) return undefined;
  return parsed;
}

function parseCompactNumber(raw: string): number | null {
  let token = raw.toLowerCase().trim();
  let multiplier = 1;

  if (token.endsWith("k")) {
    multiplier = 1_000;
    token = token.slice(0, -1);
  } else if (token.endsWith("m")) {
    multiplier = 1_000_000;
    token = token.slice(0, -1);
  }

  token = token.replace(/[^0-9.,]/g, "");
  if (!token) return null;

  if (token.includes(",") && token.includes(".")) {
    token = token.replace(/,/g, "");
  } else {
    token = token.replace(/[.,](?=\d{3}\b)/g, "");
  }

  token = token.replace(",", ".");
  const parsed = Number(token);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * multiplier);
}

function parsePriceBounds(text: string): { minPrice?: number; maxPrice?: number } {
  const hasPriceContext =
    /\b(price|cost|budget|cmim|buxhet|euro|eur|€|preis|kosto|qira|rent|shitje|blerje|miete|kira)\b/.test(text);
  const bounds: { minPrice?: number; maxPrice?: number } = {};

  const between = text.match(
    /(\d[\d.,]*\s*[km]?)\s*(?:-|to|deri|and|dhe|bis|nga)\s*(\d[\d.,]*\s*[km]?)/i
  );
  if (between) {
    const first = parseCompactNumber(between[1]);
    const second = parseCompactNumber(between[2]);
    if (first && second && first > 99 && second > 99) {
      bounds.minPrice = Math.min(first, second);
      bounds.maxPrice = Math.max(first, second);
      return bounds;
    }
  }

  const minMatch = text.match(/(?:over|above|min|from|mbi|siper|uber|ab|nga)\s*([0-9][0-9.,]*\s*[km]?)/i);
  const maxMatch = text.match(/(?:under|below|max|up to|deri|nen|unter|bis|do)\s*([0-9][0-9.,]*\s*[km]?)/i);

  if (minMatch) {
    const parsed = parseCompactNumber(minMatch[1]);
    if (parsed && parsed > 99) bounds.minPrice = parsed;
  }
  if (maxMatch) {
    const parsed = parseCompactNumber(maxMatch[1]);
    if (parsed && parsed > 99) bounds.maxPrice = parsed;
  }

  if (!hasPriceContext) return bounds;
  if (bounds.minPrice || bounds.maxPrice) return bounds;

  const explicitMoney =
    text.match(/([0-9][0-9.,]*\s*[km]?)\s*(?:€|eur|euro)\b/i) ??
    text.match(/(?:€|eur|euro)\s*([0-9][0-9.,]*\s*[km]?)/i);

  if (explicitMoney?.[1]) {
    const parsed = parseCompactNumber(explicitMoney[1]);
    if (parsed && parsed > 99) {
      bounds.maxPrice = parsed;
    }
  }

  return bounds;
}

function hasPropertyIntent(text: string): boolean {
  return /\b(propert|listing|house|apartment|office|land|store|warehouse|penthouse|object|banes|shtepi|zyr|qira|shitje|bler|immobil|miete|kira)\b/.test(
    text
  );
}

function getQuickReply(text: string, chatTexts: Record<string, string>): string | null {
  if (/\b(contact|agent|reach|phone|email|kontakt|agjent|makler)\b/.test(text)) return chatTexts.contact;
  if (/\b(account|login|admin|sign in|kycu|anmeld)\b/.test(text)) return chatTexts.account;
  if (/\b(favorite|saved|heart|preferuar|favorit)\b/.test(text)) return chatTexts.favorites;
  if (/\b(hello|hi|hey|pershendetje|tung|hallo|merhaba|zdravo)\b/.test(text)) return chatTexts.welcome;
  return null;
}

function getPropertyTitle(
  property: { title_al: string; title_en: string; title_de: string },
  locale: SupportedLocale
): string {
  if (locale === "al") return property.title_al;
  if (locale === "de") return property.title_de;
  return property.title_en;
}

function getLocationName(
  location: { name_al: string; name_en: string; name_de: string } | null | undefined,
  locale: SupportedLocale
): string {
  if (!location) return "";
  if (locale === "al") return location.name_al;
  if (locale === "de") return location.name_de;
  return location.name_en;
}

function getIntlLocale(locale: SupportedLocale): string {
  if (locale === "al") return "sq-AL";
  if (locale === "de") return "de-DE";
  if (locale === "tr") return "tr-TR";
  if (locale === "mk") return "mk-MK";
  return "en-US";
}

async function findLocationId(text: string): Promise<number | undefined> {
  const allLocations = await db.query.locations.findMany({
    columns: {
      id: true,
      name_al: true,
      name_en: true,
      name_de: true,
    },
  });

  let bestId: number | undefined;
  let bestLength = 0;

  for (const location of allLocations) {
    const variants = [location.name_al, location.name_en, location.name_de];
    for (const variant of variants) {
      const normalized = normalizeText(variant).trim();
      if (normalized.length < 3) continue;
      if (!text.includes(normalized)) continue;
      if (normalized.length > bestLength) {
        bestLength = normalized.length;
        bestId = location.id;
      }
    }
  }

  return bestId;
}

export async function POST(request: NextRequest) {
  try {
    const parsedBody = bodySchema.parse(await request.json());
    const locale = normalizeLocale(parsedBody.locale);
    const chatTexts = CHAT_TEXTS[locale] ?? CHAT_TEXTS.en;
    const normalizedMessage = normalizeText(parsedBody.message);

    const quickReply = getQuickReply(normalizedMessage, chatTexts);
    const type = parseType(normalizedMessage);
    const category = parseCategory(normalizedMessage);
    const rooms = parseRooms(normalizedMessage);
    const minArea = parseArea(normalizedMessage);
    const { minPrice, maxPrice } = parsePriceBounds(normalizedMessage);
    const locationId = await findLocationId(normalizedMessage);

    const hasFilters = Boolean(type || category || rooms || minArea || minPrice || maxPrice || locationId);
    const propertyIntent = hasPropertyIntent(normalizedMessage) || hasFilters;

    if (!propertyIntent) {
      return NextResponse.json({ reply: quickReply ?? chatTexts.defaultResponse });
    }

    const conditions: SQL[] = [eq(properties.status, "active")];
    if (type) conditions.push(eq(properties.type, type));
    if (category) conditions.push(eq(properties.category, category));
    if (rooms) conditions.push(gte(properties.rooms, rooms));
    if (minArea) conditions.push(gte(properties.surface_area, minArea));
    if (minPrice) conditions.push(gte(properties.price, minPrice));
    if (maxPrice) conditions.push(lte(properties.price, maxPrice));
    if (locationId) conditions.push(eq(properties.location_id, locationId));

    const matchedProperties = await db.query.properties.findMany({
      where: and(...conditions),
      with: {
        location: true,
      },
      orderBy: [desc(properties.featured), desc(properties.created_at)],
      limit: 3,
    });

    if (matchedProperties.length === 0) {
      const reply =
        locale === "al"
          ? "Nuk gjeta prona qe perputhen sakte me kerkesen tende. Provo me buxhet pak me te gjere ose me lokacion tjeter."
          : "I couldn't find an exact property match. Try a wider budget or another location.";
      return NextResponse.json({ reply });
    }

    const header =
      locale === "al"
        ? `Gjeta ${matchedProperties.length} prona qe perputhen:`
        : `I found ${matchedProperties.length} matching properties:`;

    const lines = [header];

    matchedProperties.forEach((property, index) => {
      const title = getPropertyTitle(property, locale);
      const locationName = getLocationName(property.location, locale);
      const price = new Intl.NumberFormat(getIntlLocale(locale), {
        style: "currency",
        currency: property.currency || "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(property.price);
      const period = property.type === "rent" ? (locale === "al" ? "/muaj" : "/mo") : "";

      lines.push(`${index + 1}. ${title}`);
      lines.push(`   ${price}${period}${locationName ? ` | ${locationName}` : ""}`);
      lines.push(`   /${locale}/properties/${property.id}`);
    });

    lines.push(
      locale === "al"
        ? "Nese don, me shkruaj buxhetin, qytetin dhe tipin e prones dhe ta ngushtoj kerkimin edhe me sakte."
        : "If you want, send me your budget, city, and property type and I can narrow the search even more."
    );

    return NextResponse.json({ reply: lines.join("\n") });
  } catch {
    return NextResponse.json(
      {
        reply:
          "I had trouble processing that request. Please try again with budget, city, and type (sale/rent).",
      },
      { status: 200 }
    );
  }
}
