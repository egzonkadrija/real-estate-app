"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { PROPERTY_CATEGORIES } from "@/lib/constants";

export default function RequestPropertyPage() {
  const t = useTranslations();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
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
          description: description || null,
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
          Your property request has been submitted. We will contact you when
          matching properties become available.
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
        Tell us what you are looking for and we will find it for you.
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
                <option value="">-- Select --</option>
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

            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? t("common.loading") : t("common.send")}
            </Button>

            {status === "error" && (
              <p className="text-center text-sm text-red-600">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
