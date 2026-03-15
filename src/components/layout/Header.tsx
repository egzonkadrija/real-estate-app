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
  const desktopLangMenuRef = React.useRef<HTMLDivElement | null>(null);
  const mobileLangButtonRef = React.useRef<HTMLDivElement | null>(null);
  const mobileLangPanelRef = React.useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = React.useRef<HTMLDivElement | null>(null);
  const mobileMenuPanelRef = React.useRef<HTMLDivElement | null>(null);

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
    setMobileOpen(false);
  }

  React.useEffect(() => {
    setLangOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!langOpen && !mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLangOpen(false);
        setMobileOpen(false);
      }
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (desktopLangMenuRef.current?.contains(target)) return;
      if (mobileLangButtonRef.current?.contains(target)) return;
      if (mobileLangPanelRef.current?.contains(target)) return;
      if (mobileMenuButtonRef.current?.contains(target)) return;
      if (mobileMenuPanelRef.current?.contains(target)) return;

      setLangOpen(false);
      setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [langOpen, mobileOpen]);

  const toggleDesktopLanguage = React.useCallback(() => {
    setLangOpen((current) => !current);
  }, []);

  const toggleMobileLanguage = React.useCallback(() => {
    setLangOpen((current) => {
      const next = !current;
      if (next) {
        setMobileOpen(false);
      }
      return next;
    });
  }, []);

  const toggleMobileMenu = React.useCallback(() => {
    setMobileOpen((current) => {
      const next = !current;
      if (next) {
        setLangOpen(false);
      }
      return next;
    });
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[70] min-w-0 overflow-x-clip border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto hidden h-20 w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(0,48rem)_minmax(0,1fr)] items-center gap-4 px-4 lg:grid">
        <Link href="/" className="flex min-w-0 items-center gap-2 justify-self-start">
          <Building2 className="h-10 w-10 text-[var(--brand-600)]" />
            <span className="inline-flex min-w-0 flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-wide text-gray-900">
              CASA
            </span>
            <span className="mt-0.5 block w-full text-center text-[11px] font-semibold tracking-[0.22em] text-[var(--brand-600)]">
              ESTATE
            </span>
          </span>
        </Link>

        <nav className="hidden w-full items-center justify-between gap-4 lg:flex">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-[var(--radius-md)] border px-4 py-2.5 text-center text-sm font-medium transition-colors xl:px-5",
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

        <div className="flex min-w-0 items-center justify-end gap-2 justify-self-end">
          <Link
            href="/favorites"
            className="relative rounded-[var(--radius-md)] p-1.5 text-gray-600 transition-colors hover:bg-[var(--surface-muted)] sm:p-2"
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
          <div ref={desktopLangMenuRef} className="relative">
            <button
              onClick={toggleDesktopLanguage}
              className="flex items-center gap-1 rounded-[var(--radius-md)] p-1.5 text-gray-600 transition-colors hover:bg-[var(--surface-muted)] sm:p-2"
              aria-expanded={langOpen}
              aria-haspopup="menu"
            >
              <Globe className="h-5 w-5" />
              <span className="text-[10px] font-medium uppercase sm:text-xs md:text-sm">
                {currentLang.code.toUpperCase()}
              </span>
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", langOpen && "rotate-180")}
              />
            </button>
            {langOpen && (
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
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 w-full max-w-[1440px] min-w-0 items-center justify-between gap-2 overflow-hidden px-3 lg:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Building2 className="h-7 w-7 shrink-0 text-[var(--brand-600)]" />
          <span className="inline-flex min-w-0 flex-col leading-none">
            <span className="text-lg font-extrabold tracking-wide text-gray-900">
              CASA
            </span>
            <span className="mt-0.5 block w-full text-center text-[10px] font-semibold tracking-[0.2em] text-[var(--brand-600)]">
              ESTATE
            </span>
          </span>
        </Link>

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1">
          <div className="flex items-center justify-center gap-1 rounded-[var(--radius-pill)] bg-white/90 px-1 shadow-sm">
            <Link
              href="/favorites"
              className="relative shrink-0 rounded-[var(--radius-md)] p-1.5 text-gray-600 transition-colors hover:bg-[var(--surface-muted)]"
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

            <div ref={mobileLangButtonRef} className="relative shrink-0">
              <button
                onClick={toggleMobileLanguage}
                className="flex items-center gap-1 rounded-[var(--radius-md)] p-1.5 text-gray-600 transition-colors hover:bg-[var(--surface-muted)]"
                aria-expanded={langOpen}
                aria-haspopup="menu"
                aria-controls="mobile-language-panel"
              >
                <Globe className="h-5 w-5" />
                <span className="text-[10px] font-medium uppercase">
                  {currentLang.code.toUpperCase()}
                </span>
                <ChevronDown
                  className={cn("h-3 w-3 transition-transform", langOpen && "rotate-180")}
                />
              </button>
            </div>
          </div>

          <div ref={mobileMenuButtonRef} className="flex shrink-0">
            <button
              onClick={toggleMobileMenu}
              className="shrink-0 rounded-[var(--radius-md)] p-1.5 text-gray-600 transition-colors hover:bg-[var(--surface-muted)]"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {langOpen && (
        <div
          id="mobile-language-panel"
          ref={mobileLangPanelRef}
          className="w-full min-w-0 overflow-x-hidden border-t border-gray-200 bg-white lg:hidden"
        >
          <div className="flex max-h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto px-3 py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  locale === lang.code
                    ? "border-[var(--brand-600)] bg-[var(--brand-50)] text-[var(--brand-700)]"
                    : "border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-100"
                )}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="w-full min-w-0 overflow-x-hidden border-t border-gray-200 bg-white lg:hidden">
          <nav
            id="mobile-nav-panel"
            ref={mobileMenuPanelRef}
            className="flex max-h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto px-3 py-2"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
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
