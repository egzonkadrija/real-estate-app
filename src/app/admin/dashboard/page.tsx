import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resolveSupportedLocale } from "@/lib/locales";

export default async function AdminDashboardRedirectPage() {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = resolveSupportedLocale(localeFromCookie);
  redirect(`/${locale}/admin/dashboard`);
}
