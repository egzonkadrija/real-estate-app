"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getLocalizedField, normalizeImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { PROPERTY_CATEGORIES, PROPERTY_TYPES } from "@/lib/constants";
import { getFloorLabelKey, supportsFloorField } from "@/lib/propertyFloor";
import type { Location } from "@/types";

const TOTAL_STEPS = 3;
const MAX_PROPERTY_IMAGES = 5;

export default function SubmitPropertyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const uiText = locale === "al"
    ? {
        successDescription: "Kerkesa juaj per prone u pranua. Ekipi yne do ta shqyrtoje shpejt.",
        step1Title: "Informacioni bazik",
        step1Description: "Vendos detajet kryesore te prones.",
        step2Description: "Ku ndodhet prona?",
        selectPlaceholder: "-- Zgjidh --",
        step3Title: "Informacioni i kontaktit",
        step3Description: "Si mund t'ju kontaktojme per kete prone?",
        errorMessage: "Ndodhi nje gabim. Ju lutem provoni perseri.",
      }
    : locale === "mk"
    ? {
        successDescription: "Baranjeto e primeno. Naskoro ke ja pregledame.",
        step1Title: "Osnovni informacii",
        step1Description: "Vnesete gi glavnite detali za imotot.",
        step2Description: "Kade se naoga imotot?",
        selectPlaceholder: "-- Izberi --",
        step3Title: "Kontakt informacii",
        step3Description: "Kako da ve kontaktirame za ovoj imot?",
        errorMessage: "Nastana greska. Obidete se povtorno.",
      }
    : locale === "de"
    ? {
        successDescription: "Ihre Anfrage wurde erhalten. Unser Team wird sie in Kurze prufen.",
        step1Title: "Grundinformationen",
        step1Description: "Geben Sie die wichtigsten Objektdaten ein.",
        step2Description: "Wo befindet sich die Immobilie?",
        selectPlaceholder: "-- Wahlen --",
        step3Title: "Kontaktinformationen",
        step3Description: "Wie konnen wir Sie zu dieser Immobilie erreichen?",
        errorMessage: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      }
    : locale === "tr"
    ? {
        successDescription: "Talebiniz alindi. Ekibimiz kisa surede inceleyecek.",
        step1Title: "Temel bilgiler",
        step1Description: "Ilaninizla ilgili ana bilgileri girin.",
        step2Description: "Mulk nerede bulunuyor?",
        selectPlaceholder: "-- Secin --",
        step3Title: "Iletisim bilgileri",
        step3Description: "Bu ilan icin size nasil ulasabiliriz?",
        errorMessage: "Bir hata olustu. Lutfen tekrar deneyin.",
      }
    : {
        successDescription: "Your property submission has been received. We will review it shortly.",
        step1Title: "Basic Information",
        step1Description: "Provide the main details about your property.",
        step2Description: "Where is the property located?",
        selectPlaceholder: "-- Select --",
        step3Title: "Contact Information",
        step3Description: "How can we reach you about this property?",
        errorMessage: "Something went wrong. Please try again.",
      };
  const [step, setStep] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Step 1: Basic info
  const [type, setType] = useState("sale");
  const [category, setCategory] = useState("apartment");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState("");

  // Step 2: Location details
  const [locationId, setLocationId] = useState("");
  const [floor, setFloor] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");

  // Step 3: Contact info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const showFloorField = supportsFloorField(category);
  const floorLabelKey = getFloorLabelKey(category);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = await res.json();
          setLocations(data);
        }
      } catch {
        // Silently handle
      }
    }
    fetchLocations();
  }, []);

  const cities = locations.filter((l) => l.type === "city");

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList) return;

    setImageError("");

    const files = Array.from(fileList);
    const remainingSlots = MAX_PROPERTY_IMAGES - uploadedImages.length;

    if (remainingSlots <= 0) {
      setImageError(`Maximum ${MAX_PROPERTY_IMAGES} images are allowed.`);
      event.target.value = "";
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setImageError(`Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be uploaded.`);
    }

    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    let uploadFailureMessage = "";

    for (const file of filesToUpload) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/property-request-images", {
          method: "POST",
          body: formData,
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || typeof data?.url !== "string") {
          throw new Error(data?.error || "Failed to upload image.");
        }

        uploadedUrls.push(data.url);
      } catch (error) {
        if (!uploadFailureMessage) {
          uploadFailureMessage = error instanceof Error
            ? error.message
            : "Failed to upload image.";
        }
      }
    }

    if (uploadedUrls.length > 0) {
      setUploadedImages((prev) => {
        const merged = [...prev, ...uploadedUrls];
        return Array.from(new Set(merged)).slice(0, MAX_PROPERTY_IMAGES);
      });
    }

    if (uploadFailureMessage) {
      setImageError(uploadFailureMessage);
    }

    setUploadingImages(false);
    event.target.value = "";
  }

  async function handleSubmit() {
    setStatus("loading");
    setErrorMessage("");

    if (uploadingImages) {
      setErrorMessage("Please wait for image upload to finish.");
      setStatus("error");
      return;
    }

    const parsedPrice = price ? Number(price) : null;
    const parsedArea = area ? Number(area) : null;
    const hasValidEmail = /\S+@\S+\.\S+/.test(email.trim());

    if (
      !title.trim() ||
      !description.trim() ||
      !parsedPrice ||
      parsedPrice <= 0 ||
      !parsedArea ||
      parsedArea <= 0 ||
      !locationId ||
      !name.trim() ||
      !hasValidEmail
    ) {
      setErrorMessage("Please fill all required fields correctly.");
      setStatus("error");
      return;
    }

    try {
      const selectedCity = cities.find((city) => city.id === Number(locationId));
      const selectedCityName = selectedCity
        ? getLocalizedField(selectedCity, "name", locale)
        : null;
      const requestType = type === "sale" ? "buy" : "rent";
      const reviewPayload = {
        source: "submit_property",
        property: {
          title,
          type,
          category,
          price: parsedPrice,
          area: parsedArea,
          images: uploadedImages.slice(0, MAX_PROPERTY_IMAGES),
          rooms: rooms ? Number(rooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          location_id: locationId ? Number(locationId) : null,
          location_name: selectedCityName,
          floor: showFloorField && floor ? Number(floor) : null,
          year_built: yearBuilt ? Number(yearBuilt) : null,
        },
        note: description || null,
      };
      const res = await fetch("/api/property-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: requestType,
          category,
          min_price: parsedPrice,
          max_price: parsedPrice,
          location: selectedCityName,
          name,
          email,
          phone: phone || null,
          description: JSON.stringify(reviewPayload),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const detail = errorData?.details?.[0]?.message;
        throw new Error(detail || errorData?.error || "Failed to submit property request");
      }
      setStatus("success");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      }
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-16 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {t("form.messageSent")}
        </h1>
        <p className="text-gray-500">
          {uiText.successDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex w-full flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t("form.submitProperty")}
        </h1>
        <p className="text-gray-500">
          {t("form.step")} {step} {t("form.of")} {TOTAL_STEPS}
        </p>
      </header>

      {/* Progress Bar */}
      <div className="mb-2 flex w-full gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i + 1 <= step ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">{uiText.step1Title}</CardTitle>
                <CardDescription>
                  {uiText.step1Description}
                </CardDescription>
              </CardHeader>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("form.propertyType")} *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {t(`property.${pt}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("form.propertyCategory")} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const nextCategory = e.target.value;
                      setCategory(nextCategory);
                      if (!supportsFloorField(nextCategory)) {
                        setFloor("");
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {PROPERTY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {t(`property.${cat}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("form.propertyTitle")} *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("form.propertyTitle")}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("form.propertyDescription")} *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t("form.propertyDescription")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("form.propertyPrice")} *
                  </label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("form.propertyArea")} (m²) *
                  </label>
                  <Input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="0"
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("property.rooms")}
                  </label>
                  <Input
                    type="number"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("property.bathrooms")}
                  </label>
                  <Input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("form.propertyImages")}
                  </label>
                  <span className="text-xs font-medium text-gray-500">
                    {uploadedImages.length}/{MAX_PROPERTY_IMAGES}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative h-20 w-24 overflow-hidden rounded-lg border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={normalizeImageUrl(url)}
                        alt={`Property upload ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedImages((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black/85"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {uploadedImages.length < MAX_PROPERTY_IMAGES && (
                    <label className="flex h-20 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-blue-500 hover:text-blue-600">
                      <Upload className="h-5 w-5" />
                      <span className="mt-1 text-[11px]">
                        {uploadingImages ? t("common.loading") : "Add"}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/svg+xml"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Maximum {MAX_PROPERTY_IMAGES} images.
                </p>
                {imageError ? (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {imageError}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">
                  {t("property.location")}
                </CardTitle>
                <CardDescription>
                  {uiText.step2Description}
                </CardDescription>
              </CardHeader>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("filters.location")} *
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">{uiText.selectPlaceholder}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {getLocalizedField(city, "name", locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`grid gap-4 ${showFloorField ? "grid-cols-2" : "grid-cols-1"}`}>
                {showFloorField ? (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t(floorLabelKey)}
                    </label>
                    <Input
                      type="number"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                ) : null}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("property.yearBuilt")}
                  </label>
                  <Input
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    placeholder="2024"
                    min={1900}
                    max={2030}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">{uiText.step3Title}</CardTitle>
                <CardDescription>
                  {uiText.step3Description}
                </CardDescription>
              </CardHeader>

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
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t("common.back")}
              </Button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={uploadingImages}
              >
                {t("common.next")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={status === "loading" || uploadingImages}
              >
                {status === "loading"
                  ? t("common.loading")
                  : uploadingImages
                  ? "Uploading images..."
                  : t("common.send")}
              </Button>
            )}
          </div>

          {status === "error" && (
            <p className="mt-4 text-center text-sm text-red-600">
              {errorMessage || uiText.errorMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
