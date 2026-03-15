"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Building2, Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.78a8.18 8.18 0 004.76 1.52V6.85a4.84 4.84 0 01-1-.16z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ViberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.518 6.769.399 9.932c-.12 3.163-.276 9.1 5.597 10.786l.007.001-.004 2.462s-.039.993.617 1.196c.793.244 1.258-.51 2.015-1.326.415-.449.988-1.109 1.42-1.615 3.913.33 6.92-.423 7.265-.537.794-.263 5.285-.834 6.017-6.804.755-6.163-.362-10.055-2.332-11.805l-.002-.001C19.539.652 16.122-.066 11.398.002zM12.34 1.5c4.226-.049 7.173.478 8.486 1.63 1.635 1.456 2.676 4.907 2.013 10.31-.614 5.009-4.279 5.395-4.963 5.621-.285.095-2.89.744-6.276.497 0 0-2.486 2.997-3.262 3.782-.121.123-.266.178-.362.153-.134-.035-.17-.196-.169-.432l.025-4.108c-4.928-1.42-4.64-6.452-4.54-9.105.1-2.653.726-4.832 2.166-6.254 2.003-1.823 5.655-2.075 6.882-2.094zm-.15 2.69a.488.488 0 00-.488.5.49.49 0 00.498.488c1.08-.005 2.11.381 2.898 1.122.79.74 1.248 1.758 1.298 2.832a.49.49 0 00.507.472.49.49 0 00.472-.508c-.06-1.3-.622-2.53-1.581-3.428-.96-.9-2.208-1.403-3.52-1.478a.472.472 0 00-.083-.001zm-3.06.96c-.196-.012-.39.092-.535.327l-.634.95c-.26.382-.56.696-.58 1.137-.012.3.1.58.268.85l.04.066c.714 1.206 1.592 2.322 2.66 3.27l.039.035.035.039c.948 1.068 2.064 1.946 3.27 2.66l.066.04c.27.168.55.28.85.268.441-.02.755-.32 1.138-.58l.948-.634c.37-.248.476-.745.234-1.098l-1.314-1.942a.696.696 0 00-1.024-.16l-.727.545c-.094.071-.214.08-.318.025l-.022-.011a8.98 8.98 0 01-1.6-1.12 8.98 8.98 0 01-1.12-1.6l-.011-.022a.234.234 0 01.025-.318l.545-.727a.696.696 0 00-.16-1.024L9.652 5.29a.689.689 0 00-.521-.14zm3.458.85a.49.49 0 00-.455.518c.044.623.315 1.206.763 1.636.449.43 1.04.68 1.664.7a.487.487 0 00.506-.468.49.49 0 00-.468-.507 1.474 1.474 0 01-1.01-.426 1.47 1.47 0 01-.467-.997.488.488 0 00-.533-.455z" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="overflow-hidden border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-amber-400" />
              <span className="inline-flex flex-col leading-none">
                <span className="text-xl font-extrabold tracking-wide text-white">
                  NOVA
                </span>
                <span className="mt-0.5 block w-full text-center text-[10px] font-semibold tracking-[0.22em] text-amber-400">
                  STATE
                </span>
              </span>
            </Link>
            <p className="mt-4 text-center text-sm leading-relaxed">
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
              {t("footer.legal")}
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
              <li className="flex flex-wrap items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span className="min-w-0 flex-1 break-words">Shkup, Maqedoni e Veriut</span>
              </li>
              <li className="flex flex-wrap items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="min-w-0 break-words">+389 2 123 456</span>
                <a href="https://wa.me/38921234567" target="_blank" rel="noopener noreferrer" className="ml-1 text-green-400 hover:text-green-300">
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
                <a href="viber://chat?number=%2B38921234567" className="text-purple-400 hover:text-purple-300">
                  <ViberIcon className="h-4 w-4" />
                </a>
              </li>
              <li className="flex flex-wrap items-start gap-2 text-sm">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span className="min-w-0 flex-1 break-all">info@novabuildings.com</span>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="#" className="rounded-lg p-2 transition-colors hover:bg-gray-800">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg p-2 transition-colors hover:bg-gray-800">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg p-2 transition-colors hover:bg-gray-800">
                <TikTokIcon className="h-5 w-5" />
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
