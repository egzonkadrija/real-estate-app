"use client";

import { Link } from "@/i18n/routing";

import { Button } from "@/components/ui/button";

export function HeroCTAActions({
  submitLabel,
  requestLabel,
  showSubmitRequest = true,
  compact = false,
}: {
  submitLabel: string;
  requestLabel: string;
  showSubmitRequest?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-start justify-center gap-3 ${compact ? "flex-row" : "flex-col sm:flex-row"}`}>
      {showSubmitRequest && (
        <>
          <Button
            asChild
            size="lg"
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            <Link href="/submit-property">{submitLabel}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="border border-white bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/request-property">{requestLabel}</Link>
          </Button>
        </>
      )}
    </div>
  );
}
