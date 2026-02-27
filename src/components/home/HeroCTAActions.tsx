"use client";

import { Link } from "@/i18n/routing";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroCTAActions({
  submitLabel,
  requestLabel,
  aiLabel,
  showSubmitRequest = true,
  showSearchWithAI = true,
  compact = false,
}: {
  submitLabel: string;
  requestLabel: string;
  aiLabel: string;
  showSubmitRequest?: boolean;
  showSearchWithAI?: boolean;
  compact?: boolean;
}) {
  function openAIChat() {
    window.dispatchEvent(new Event("open-ai-chat"));
  }

  return (
    <div className={`flex items-start justify-center gap-3 ${compact ? "flex-row" : "flex-col sm:flex-row"}`}>
      {showSearchWithAI && (
        <Button
          variant="outline"
          size="lg"
          className="border border-white bg-white/10 text-white hover:bg-white/20"
          onClick={openAIChat}
        >
          <Sparkles className="h-4 w-4" />
          {aiLabel}
        </Button>
      )}
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
