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

export default async function AdminDashboardRedirectPage() {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = resolveLocale(localeFromCookie);
  redirect(`/${locale}/admin/dashboard`);
}
