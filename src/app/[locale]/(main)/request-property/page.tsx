"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { normalizeImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Upload, X } from "lucide-react";
import { PROPERTY_CATEGORIES } from "@/lib/constants";

const MAX_REQUEST_IMAGES = 5;

export default function RequestPropertyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const uiText = locale === "al"
    ? {
        successDescription: "Kerkesa juaj u dergua. Do t'ju kontaktojme sapo te kemi prona te pershtatshme.",
        introDescription: "Na tregoni cfare kerkoni dhe ne do t'ju ndihmojme ta gjeni.",
        selectPlaceholder: "-- Zgjidh --",
        errorMessage: "Ndodhi nje gabim. Ju lutem provoni perseri.",
      }
    : locale === "mk"
    ? {
        successDescription: "Baranjeto e isprateno. Ke ve kontaktirame koga ke ima soodvetni imoti.",
        introDescription: "Kazete ni sto barate i ke vi pomogneme da go najdete.",
        selectPlaceholder: "-- Izberi --",
        errorMessage: "Nastana greska. Obidete se povtorno.",
      }
    : locale === "de"
    ? {
        successDescription: "Ihre Anfrage wurde gesendet. Wir kontaktieren Sie bei passenden Immobilien.",
        introDescription: "Sagen Sie uns, was Sie suchen, und wir helfen Ihnen es zu finden.",
        selectPlaceholder: "-- Wahlen --",
        errorMessage: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      }
    : locale === "tr"
    ? {
        successDescription: "Talebiniz gonderildi. Uygun ilanlar oldugunda sizinle iletisime gececegiz.",
        introDescription: "Ne aradiginizi bize soyleyin, bulmaniza yardimci olalim.",
        selectPlaceholder: "-- Secin --",
        errorMessage: "Bir hata olustu. Lutfen tekrar deneyin.",
      }
    : {
        successDescription: "Your property request has been submitted. We will contact you when matching properties become available.",
        introDescription: "Tell us what you are looking for and we will find it for you.",
        selectPlaceholder: "-- Select --",
        errorMessage: "Something went wrong. Please try again.",
      };
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [type, setType] = useState("buy");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState("");

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList) return;

    setImageError("");
    const files = Array.from(fileList);
    const remainingSlots = MAX_REQUEST_IMAGES - uploadedImages.length;

    if (remainingSlots <= 0) {
      setImageError(`Maximum ${MAX_REQUEST_IMAGES} images are allowed.`);
      event.target.value = "";
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setImageError(
        `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be uploaded.`
      );
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
          uploadFailureMessage =
            error instanceof Error ? error.message : "Failed to upload image.";
        }
      }
    }

    if (uploadedUrls.length > 0) {
      setUploadedImages((prev) => {
        const merged = [...prev, ...uploadedUrls];
        return Array.from(new Set(merged)).slice(0, MAX_REQUEST_IMAGES);
      });
    }

    if (uploadFailureMessage) {
      setImageError(uploadFailureMessage);
    }

    setUploadingImages(false);
    event.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    if (uploadingImages) {
      setStatus("error");
      return;
    }
    try {
      const requestPayload = {
        source: "request_property",
        property: {
          images: uploadedImages.slice(0, MAX_REQUEST_IMAGES),
        },
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
          location,
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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
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
    <div className="mx-auto max-w-2xl px-4 py-8">
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
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("filters.location")}
              />
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

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  {t("form.propertyImages")}
                </label>
                <span className="text-xs font-medium text-gray-500">
                  {uploadedImages.length}/{MAX_REQUEST_IMAGES}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative h-20 w-24 overflow-hidden rounded-lg border border-gray-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeImageUrl(url)}
                      alt={`Requested property upload ${index + 1}`}
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

                {uploadedImages.length < MAX_REQUEST_IMAGES && (
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
                Maximum {MAX_REQUEST_IMAGES} images.
              </p>
              {imageError ? (
                <p className="mt-2 text-xs font-medium text-red-600">{imageError}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading" || uploadingImages}
            >
              {status === "loading"
                ? t("common.loading")
                : uploadingImages
                ? "Uploading images..."
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
  );
}
