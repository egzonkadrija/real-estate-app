import { LOCALES, type Locale } from "@/lib/constants";

export const DEFAULT_LOCALE: Locale = "al";

export function isSupportedLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function resolveSupportedLocale(rawLocale?: string): Locale {
  if (rawLocale && isSupportedLocale(rawLocale)) {
    return rawLocale;
  }

  return DEFAULT_LOCALE;
}
