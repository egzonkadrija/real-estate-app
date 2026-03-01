import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const LEGACY_PROPERTY_IMAGE_PATTERN = /^\/uploads\/property-(\d+)-(\d+)\.(jpg|jpeg|png|webp|avif|gif|bmp|svg|jfif)$/i;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeImageUrl(
  url: string | null | undefined,
  fallback: string = "/uploads/placeholder.jpg"
): string {
  if (typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  const legacyMatch = trimmed.match(LEGACY_PROPERTY_IMAGE_PATTERN);
  if (!legacyMatch) return trimmed;

  const slot = Number(legacyMatch[2]);
  const extension = legacyMatch[3];

  if (!Number.isInteger(slot) || slot < 1 || slot > 3) {
    return fallback;
  }

  return `/uploads/property-${slot}.${extension}`;
}

export function formatPrice(price: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(area: number): string {
  return `${area.toLocaleString()} m²`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLocalizedField<T extends object>(
  obj: T | null | undefined,
  field: string,
  locale: string
): string {
  const record = obj as Record<string, unknown> | null | undefined;
  const localeFallbackOrder: Record<string, string[]> = {
    mk: ["mk", "al", "en", "de", "tr"],
    al: ["al", "en", "de", "mk", "tr"],
    en: ["en", "al", "de", "mk", "tr"],
    de: ["de", "en", "al", "mk", "tr"],
    tr: ["tr", "en", "al", "de", "mk"],
  };

  const order = localeFallbackOrder[locale] ?? [locale, "en", "al", "de", "tr", "mk"];

  for (const candidateLocale of order) {
    const candidate = record?.[`${field}_${candidateLocale}`];
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return "";
}

export function calculateMortgage(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
