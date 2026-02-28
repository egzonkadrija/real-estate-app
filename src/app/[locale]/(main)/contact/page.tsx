import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/forms/ContactForm";
import { PropertyMap } from "@/components/property/PropertyMap";
import { FloatingSidebar } from "@/components/property/FloatingSidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NORTH_MACEDONIA_CENTER } from "@/lib/constants";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Locale } from "@/i18n/routing";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const contactText = locale === "al"
    ? {
        addressLabel: "Adresa",
        workingHoursLabel: "Orari i punes",
        weekdays: "Hen - Pre: 09:00 - 18:00",
        saturday: "Sht: 10:00 - 14:00",
        country: "Maqedonia e Veriut",
      }
    : locale === "mk"
    ? {
        addressLabel: "Adresa",
        workingHoursLabel: "Rabotno vreme",
        weekdays: "Pon - Pet: 09:00 - 18:00",
        saturday: "Sab: 10:00 - 14:00",
        country: "Severna Makedonija",
      }
    : locale === "de"
    ? {
        addressLabel: "Adresse",
        workingHoursLabel: "Arbeitszeiten",
        weekdays: "Mo - Fr: 09:00 - 18:00",
        saturday: "Sa: 10:00 - 14:00",
        country: "Nordmazedonien",
      }
    : locale === "tr"
    ? {
        addressLabel: "Adres",
        workingHoursLabel: "Calisma saatleri",
        weekdays: "Pzt - Cum: 09:00 - 18:00",
        saturday: "Cmt: 10:00 - 14:00",
        country: "Kuzey Makedonya",
      }
    : {
        addressLabel: "Address",
        workingHoursLabel: "Working Hours",
        weekdays: "Mon - Fri: 09:00 - 18:00",
        saturday: "Sat: 10:00 - 14:00",
        country: "North Macedonia",
      };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
        {t("common.contact")}
      </h1>
      <p className="mb-10 text-lg text-gray-600">
        {t("footer.description")}
      </p>

      <div className="grid grid-cols-1 gap-8 md:items-start lg:grid-cols-2">
        {/* Left Column: Contact Info + Map */}
        <div className="space-y-6">
          {/* Contact Details */}
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{contactText.addressLabel}</h3>
                  <p className="text-sm text-gray-600">
                    Rr. Agim Ramadani, Nr. 15
                    <br />
                    1000 Skopje, {contactText.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t("form.phone")}
                  </h3>
                  <p className="text-sm text-gray-600">+389 2 123 456</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t("form.email")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    zmija9nqi@oninova.net
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {contactText.workingHoursLabel}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {contactText.weekdays}
                    <br />
                    {contactText.saturday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="overflow-hidden">
            <div className="h-[500px]">
              <PropertyMap
                latitude={NORTH_MACEDONIA_CENTER.lat}
                longitude={NORTH_MACEDONIA_CENTER.lng}
                title="NovaBuildings"
                zoom={12}
                className="h-full w-full"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Contact Form (same floating behavior as property sidebar) */}
        <FloatingSidebar className="md:col-span-1" footerOffset={48}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("form.sendMessage")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </FloatingSidebar>
      </div>
    </div>
  );
}
