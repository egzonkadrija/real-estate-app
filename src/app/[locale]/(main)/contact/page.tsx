import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/forms/ContactForm";
import { PropertyMap } from "@/components/property/PropertyMap";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KOSOVO_CENTER } from "@/lib/constants";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
        {t("common.contact")}
      </h1>
      <p className="mb-10 text-lg text-gray-600">
        {t("footer.description")}
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column: Contact Info + Form */}
        <div className="space-y-6">
          {/* Contact Details */}
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="text-sm text-gray-600">
                    Rr. Agim Ramadani, Nr. 15
                    <br />
                    10000 Prishtina, Kosovo
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
                  <p className="text-sm text-gray-600">+383 44 123 456</p>
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
                    info@kosovorealestate.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Working Hours
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mon - Fri: 09:00 - 18:00
                    <br />
                    Sat: 10:00 - 14:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
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
        </div>

        {/* Right Column: Map */}
        <div>
          <Card className="overflow-hidden">
            <div className="h-[500px]">
              <PropertyMap
                latitude={KOSOVO_CENTER.lat}
                longitude={KOSOVO_CENTER.lng}
                title="Kosovo Real Estate"
                zoom={12}
                className="h-full w-full"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
