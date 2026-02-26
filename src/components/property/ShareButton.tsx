"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  label: string;
}

export function ShareButton({ title, label }: ShareButtonProps) {
  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="flex items-center gap-2"
    >
      <Share2 className="h-4 w-4" />
      {label}
    </Button>
  );
}
