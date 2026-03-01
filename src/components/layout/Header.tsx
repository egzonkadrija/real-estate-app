"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import {
  Menu,
  X,
  Heart,
  Globe,
  ChevronDown,
  Building2,
  Phone,
  Info,
  Send,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { type Locale } from "@/lib/constants";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { favorites } = useFavorites();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);

  const navLinks = [
    { href: "/" as const, label: t("properties"), icon: Building2 },
    { href: "/about" as const, label: t("about"), icon: Info },
    { href: "/contact" as const, label: t("contact"), icon: Phone },
    { href: "/submit-property" as const, label: t("submitProperty"), icon: Send },
    { href: "/request-property" as const, label: t("requestProperty"), icon: FileText },
  ];

  const languages: Array<{ code: Locale; label: string; flag: string }> = [
    { code: "mk", label: "Macedonian", flag: "🇲🇰" },
    { code: "al", label: "Shqip", flag: "🇦🇱" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];
  const isLinkActive = React.useCallback(
    (href: (typeof navLinks)[number]["href"]) =>
      pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[70] w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-10 w-10 text-[var(--brand-600)]" />
          <span className="inline-flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-wide text-gray-900">
              NOVA
            </span>
            <span className="mt-0.5 block w-full text-center text-[11px] font-semibold tracking-[0.22em] text-[var(--brand-600)]">
              STATE
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-4 lg:flex">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-[var(--radius-md)] border px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-[var(--brand-600)] bg-[var(--brand-50)] text-[var(--brand-700)]"
                    : "border-transparent text-gray-700 hover:border-[var(--border)] hover:bg-[var(--surface-muted)] hover:text-[var(--brand-700)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/favorites"
            className="relative rounded-[var(--radius-md)] p-2 text-gray-600 transition-colors hover:bg-[var(--surface-muted)]"
          >
            <Heart
              className={cn(
                "h-5 w-5",
                favorites.length > 0 && "fill-red-500 text-red-500"
              )}
            />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {favorites.length > 9 ? "9+" : favorites.length}
              </span>
            )}
          </Link>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 rounded-[var(--radius-md)] p-2 text-gray-600 transition-colors hover:bg-[var(--surface-muted)]"
            >
              <Globe className="h-5 w-5" />
              <span className="hidden text-sm sm:inline">
                {currentLang.code.toUpperCase()}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {langOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-100",
                        locale === lang.code
                          ? "bg-[var(--brand-50)] text-[var(--brand-700)]"
                          : "text-gray-700"
                      )}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-[var(--radius-md)] p-2 text-gray-600 transition-colors hover:bg-[var(--surface-muted)] lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <nav className="flex flex-col px-4 py-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "border-[var(--brand-600)] bg-[var(--brand-50)] text-[var(--brand-700)]"
                      : "border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-100"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
