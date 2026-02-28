import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { LOCALES, type Locale as DomainLocale } from "@/lib/constants";
import { DEFAULT_LOCALE } from "@/lib/locales";

export const routing = defineRouting({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
});

export type Locale = DomainLocale;

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
