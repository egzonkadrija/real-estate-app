"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getLocalizedField } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { PROPERTY_CATEGORIES, PROPERTY_TYPES } from "@/lib/constants";
import type { Location } from "@/types";

const TOTAL_STEPS = 3;

export default function SubmitPropertyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Step 1: Basic info
  const [type, setType] = useState("sale");
  const [category, setCategory] = useState("apartment");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  // Step 2: Location details
  const [locationId, setLocationId] = useState("");
  const [floor, setFloor] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");

  // Step 3: Contact info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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

  async function handleSubmit() {
    setStatus("loading");
    try {
      const res = await fetch("/api/property-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          category,
          title,
          description,
          price: Number(price),
          area: Number(area),
          rooms: rooms ? Number(rooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          location_id: locationId ? Number(locationId) : null,
          floor: floor ? Number(floor) : null,
          year_built: yearBuilt ? Number(yearBuilt) : null,
          name,
          email,
          phone,
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
          Your property submission has been received. We will review it shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
        {t("form.submitProperty")}
      </h1>
      <p className="mb-6 text-gray-500">
        {t("form.step")} {step} {t("form.of")} {TOTAL_STEPS}
      </p>

      {/* Progress Bar */}
      <div className="mb-8 flex gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i + 1 <= step ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>
                  Provide the main details about your property.
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
                    onChange={(e) => setCategory(e.target.value)}
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
                  Where is the property located?
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
                  <option value="">-- Select --</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {getLocalizedField(city, "name", locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("property.floor")}
                  </label>
                  <Input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="0"
                    min={0}
                  />
                </div>
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
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>
                  How can we reach you about this property?
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
              <Button type="button" onClick={() => setStep(step + 1)}>
                {t("common.next")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={status === "loading"}
              >
                {status === "loading" ? t("common.loading") : t("common.send")}
              </Button>
            )}
          </div>

          {status === "error" && (
            <p className="mt-4 text-center text-sm text-red-600">
              Something went wrong. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
