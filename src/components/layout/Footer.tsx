"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Building2, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-amber-400" />
              <span className="text-xl font-bold text-white">
                Nova<span className="text-amber-400">Buildings</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/properties" as const, label: t("common.properties") },
                { href: "/about" as const, label: t("common.about") },
                { href: "/contact" as const, label: t("common.contact") },
                { href: "/faq" as const, label: t("common.faq") },
                { href: "/submit-property" as const, label: t("common.submitProperty") },
                { href: "/request-property" as const, label: t("common.requestProperty") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm transition-colors hover:text-white"
                >
                  {t("common.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm transition-colors hover:text-white"
                >
                  {t("common.terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.contactInfo")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>Shkup, Maqedoni e Veriut</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-amber-400" />
                <span>+389 2 123 456</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-amber-400" />
                <span>info@novabuildings.com</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="#" className="rounded-lg p-2 transition-colors hover:bg-gray-800">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg p-2 transition-colors hover:bg-gray-800">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg p-2 transition-colors hover:bg-gray-800">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} NovaBuildings. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
