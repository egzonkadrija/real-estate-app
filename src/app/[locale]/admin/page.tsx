import { redirect } from "next/navigation";
import { Locale } from "@/i18n/routing";

export default async function LocaleAdminIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/dashboard`);
}
