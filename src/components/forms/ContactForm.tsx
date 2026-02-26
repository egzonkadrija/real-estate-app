"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Send, CheckCircle } from "lucide-react";

interface ContactFormProps {
  propertyId?: number;
}

export function ContactForm({ propertyId }: ContactFormProps) {
  const locale = useLocale();
  const t = useTranslations("form");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const errorMessage = locale === "al"
    ? "Ndodhi nje gabim. Ju lutem provoni perseri."
    : locale === "mk"
    ? "Nastana greska. Obidete se povtorno."
    : locale === "de"
    ? "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut."
    : locale === "tr"
    ? "Bir hata olustu. Lutfen tekrar deneyin."
    : "Something went wrong. Please try again.";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId || null,
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-600" />
        <p className="text-lg font-semibold text-green-800">{t("messageSent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t("name")} *
        </label>
        <input
          name="name"
          required
          placeholder={t("yourName")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t("email")} *
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder={t("yourEmail")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t("phone")}
        </label>
        <input
          name="phone"
          type="tel"
          placeholder={t("yourPhone")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t("message")} *
        </label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder={t("yourMessage")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {status === "loading" ? "..." : t("sendMessage")}
      </button>
      {status === "error" && (
        <p className="text-center text-sm text-red-600">{errorMessage}</p>
      )}
    </form>
  );
}
