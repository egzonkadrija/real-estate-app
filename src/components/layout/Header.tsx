"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);

  const navLinks = [
    { href: "/properties" as const, label: t("properties"), icon: Building2 },
    { href: "/about" as const, label: t("about"), icon: Info },
    { href: "/contact" as const, label: t("contact"), icon: Phone },
    { href: "/submit-property" as const, label: t("submitProperty"), icon: Send },
    { href: "/request-property" as const, label: t("requestProperty"), icon: FileText },
  ];

  const languages = [
    { code: "al" as const, label: "Shqip", flag: "🇲🇰" },
    { code: "en" as const, label: "English", flag: "🇬🇧" },
    { code: "de" as const, label: "Deutsch", flag: "🇩🇪" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  function switchLocale(newLocale: "al" | "en" | "de") {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
  }

  function openAIChat() {
    window.dispatchEvent(new Event("open-ai-chat"));
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-amber-500" />
          <span className="text-xl font-bold text-gray-900">
            Nova<span className="text-amber-500">Buildings</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-amber-600",
                pathname === link.href
                  ? "text-amber-600"
                  : "text-gray-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search with AI Button */}
          <button
            onClick={openAIChat}
            className="hidden items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-amber-400 hover:text-amber-600 sm:inline-flex"
          >
            <Sparkles className="h-4 w-4" />
            {t("searchWithAI")}
          </button>

          <Link
            href="/favorites"
            className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Heart className="h-5 w-5" />
          </Link>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
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
                          ? "bg-amber-50 text-amber-600"
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
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-amber-50 text-amber-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                openAIChat();
              }}
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Sparkles className="h-4 w-4" />
              {t("searchWithAI")}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
