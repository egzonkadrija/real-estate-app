import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPPORTED_LOCALES = ["mk", "al", "en", "de", "tr"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function resolveLocale(rawLocale?: string): SupportedLocale {
  if (rawLocale && SUPPORTED_LOCALES.includes(rawLocale as SupportedLocale)) {
    return rawLocale as SupportedLocale;
  }
  return "al";
}

export default async function AdminPropertiesRedirectPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("NEXT_LOCALE")?.value);
  redirect(`/${locale}/admin/properties`);
}
