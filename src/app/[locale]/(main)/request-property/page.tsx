"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { PROPERTY_CATEGORIES } from "@/lib/constants";
import { getLocalizedField } from "@/lib/utils";
import type { Location } from "@/types";

const MAX_REQUEST_LOCATIONS = 5;

export default function RequestPropertyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const uiText = locale === "al"
    ? {
        successDescription: "Kerkesa juaj u dergua. Do t'ju kontaktojme sapo te kemi prona te pershtatshme.",
        introDescription: "Na tregoni cfare kerkoni dhe ne do t'ju ndihmojme ta gjeni.",
        selectPlaceholder: "-- Zgjidh --",
        errorMessage: "Ndodhi nje gabim. Ju lutem provoni perseri.",
        locationHelper: "Zgjidh deri ne 5 qytete ku mund te jete prona.",
        locationLimitError: "Mund te zgjidhni deri ne 5 lokacione.",
        loadingLocations: "Duke ngarkuar lokacionet...",
        noLocations: "Nuk ka lokacione te disponueshme.",
      }
    : locale === "mk"
    ? {
        successDescription: "Baranjeto e isprateno. Ke ve kontaktirame koga ke ima soodvetni imoti.",
        introDescription: "Kazete ni sto barate i ke vi pomogneme da go najdete.",
        selectPlaceholder: "-- Izberi --",
        errorMessage: "Nastana greska. Obidete se povtorno.",
        locationHelper: "Izberete do 5 gradovi kade moze da se najde imotot.",
        locationLimitError: "Mozete da izberete najмnogu 5 lokacii.",
        loadingLocations: "Se vcituvat lokaciite...",
        noLocations: "Nema dostapni lokacii.",
      }
    : locale === "de"
    ? {
        successDescription: "Ihre Anfrage wurde gesendet. Wir kontaktieren Sie bei passenden Immobilien.",
        introDescription: "Sagen Sie uns, was Sie suchen, und wir helfen Ihnen es zu finden.",
        selectPlaceholder: "-- Wahlen --",
        errorMessage: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
        locationHelper: "Wahlen Sie bis zu 5 Stadte aus, in denen die Immobilie liegen kann.",
        locationLimitError: "Sie konnen bis zu 5 Standorte auswahlen.",
        loadingLocations: "Standorte werden geladen...",
        noLocations: "Keine Standorte verfugbar.",
      }
    : locale === "tr"
    ? {
        successDescription: "Talebiniz gonderildi. Uygun ilanlar oldugunda sizinle iletisime gececegiz.",
        introDescription: "Ne aradiginizi bize soyleyin, bulmaniza yardimci olalim.",
        selectPlaceholder: "-- Secin --",
        errorMessage: "Bir hata olustu. Lutfen tekrar deneyin.",
        locationHelper: "Mulkun bulunabilecegi en fazla 5 sehir secin.",
        locationLimitError: "En fazla 5 konum secebilirsiniz.",
        loadingLocations: "Konumlar yukleniyor...",
        noLocations: "Kullanilabilir konum yok.",
      }
    : {
        successDescription: "Your property request has been submitted. We will contact you when matching properties become available.",
        introDescription: "Tell us what you are looking for and we will find it for you.",
        selectPlaceholder: "-- Select --",
        errorMessage: "Something went wrong. Please try again.",
        locationHelper: "Select up to 5 cities where the property could be located.",
        locationLimitError: "You can select up to 5 locations.",
        loadingLocations: "Loading locations...",
        noLocations: "No locations available.",
      };
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationError, setLocationError] = useState("");

  const [type, setType] = useState("buy");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations?type=city");
        if (!res.ok) {
          throw new Error("Failed to load locations");
        }

        const data = await res.json();
        setLocations(Array.isArray(data) ? data : []);
      } catch {
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    }

    void fetchLocations();
  }, []);

  const selectedLocations = selectedLocationIds
    .map((id) => locations.find((city) => city.id === id))
    .filter((city): city is Location => Boolean(city));

  function getLocationLabel(city: Location) {
    return getLocalizedField(city, "name", locale);
  }

  function toggleLocation(locationId: number) {
    setLocationError("");
    setSelectedLocationIds((current) => {
      if (current.includes(locationId)) {
        return current.filter((id) => id !== locationId);
      }

      if (current.length >= MAX_REQUEST_LOCATIONS) {
        setLocationError(uiText.locationLimitError);
        return current;
      }

      return [...current, locationId];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const joinedLocations = selectedLocations
        .map((city) => getLocationLabel(city))
        .filter((value) => value.trim().length > 0)
        .join(", ");
      const requestPayload = {
        source: "request_property",
        note: description || null,
      };

      const res = await fetch("/api/property-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          category,
          min_price: minPrice ? Number(minPrice) : null,
          max_price: maxPrice ? Number(maxPrice) : null,
          location: joinedLocations || null,
          name,
          email,
          phone: phone || null,
          description: JSON.stringify(requestPayload),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 py-16">
        <div className="w-full max-w-2xl text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {t("form.messageSent")}
          </h1>
          <p className="text-gray-500">
            {uiText.successDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          {t("form.requestProperty")}
        </h1>
        <p className="mb-6 text-gray-500">
          {uiText.introDescription}
        </p>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("form.propertyType")} *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="buy">{t("property.sale")}</option>
                <option value="rent">{t("property.rent")}</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("form.propertyCategory")} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">{uiText.selectPlaceholder}</option>
                {PROPERTY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`property.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("filters.minPrice")}
                </label>
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  min={0}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("filters.maxPrice")}
                </label>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="0"
                  min={0}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("filters.location")}
              </label>
              <p className="mb-2 text-xs text-gray-500">
                {uiText.locationHelper}
              </p>
              {selectedLocations.length > 0 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedLocations.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => toggleLocation(city.id)}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      {getLocationLabel(city)} ×
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-300">
                {loadingLocations ? (
                  <p className="px-3 py-3 text-sm text-gray-500">
                    {uiText.loadingLocations}
                  </p>
                ) : locations.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-gray-500">
                    {uiText.noLocations}
                  </p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {locations.map((city) => {
                      const isSelected = selectedLocationIds.includes(city.id);
                      const disableSelection =
                        !isSelected && selectedLocationIds.length >= MAX_REQUEST_LOCATIONS;

                      return (
                        <label
                          key={city.id}
                          className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${
                            disableSelection ? "cursor-not-allowed bg-gray-50 text-gray-400" : "hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleLocation(city.id)}
                            disabled={disableSelection}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{getLocationLabel(city)}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {selectedLocationIds.length}/{MAX_REQUEST_LOCATIONS}
              </p>
              {locationError ? (
                <p className="mt-2 text-sm text-red-600">
                  {locationError}
                </p>
              ) : null}
            </div>

            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("form.name")} *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("form.yourName")}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("form.email")} *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("form.yourEmail")}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("form.phone")}
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("form.yourPhone")}
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("form.propertyDescription")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={t("form.yourMessage")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading"
                ? t("common.loading")
                : t("common.send")}
            </Button>

            {status === "error" && (
              <p className="text-center text-sm text-red-600">
                {uiText.errorMessage}
              </p>
            )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
