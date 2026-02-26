"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]",
        secondary:
          "border-transparent bg-[var(--surface-muted)] text-gray-900 hover:bg-[var(--brand-100)]",
        outline: "border-[var(--border)] text-gray-700",
        success:
          "border-transparent bg-teal-50 text-teal-800 hover:bg-teal-100",
        warning:
          "border-transparent bg-amber-50 text-amber-800 hover:bg-amber-100",
        destructive:
          "border-transparent bg-red-50 text-red-800 hover:bg-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
