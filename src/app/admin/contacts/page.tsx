import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resolveSupportedLocale } from "@/lib/locales";

export default async function AdminContactsRedirectPage() {
  const cookieStore = await cookies();
  const locale = resolveSupportedLocale(cookieStore.get("NEXT_LOCALE")?.value);
  redirect(`/${locale}/admin/contacts`);
}
