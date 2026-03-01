import { redirect } from "next/navigation";
import { Locale } from "@/i18n/routing";

type PropertiesPageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PropertiesPage({
  params,
  searchParams,
}: PropertiesPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === "string") {
      query.set(key, value);
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
    }
  }

  const qs = query.toString();
  redirect(`/${locale}${qs ? `?${qs}` : ""}`);
}
