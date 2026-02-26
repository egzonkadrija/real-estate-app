"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingSidebarProps {
  children: React.ReactNode;
  className?: string;
  topOffset?: number;
  footerOffset?: number;
}

export function FloatingSidebar({
  children,
  className,
  topOffset = 96,
  footerOffset = 32,
}: FloatingSidebarProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({});
  const [placeholderHeight, setPlaceholderHeight] = React.useState(0);

  React.useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      if (window.innerWidth < 768) {
        setStyle({});
        setPlaceholderHeight(0);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerTop = window.scrollY + containerRect.top;
      const contentHeight = content.offsetHeight;
      const shouldFix = containerRect.top <= topOffset;
      const footer = document.querySelector("footer");
      const footerTop = footer
        ? window.scrollY + footer.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;
      const viewportTop = window.scrollY + topOffset;

      if (!shouldFix) {
        setStyle({ position: "relative", top: 0, width: "100%" });
        setPlaceholderHeight(0);
        return;
      }

      setPlaceholderHeight(contentHeight);

      const stopTopInDocument = footerTop - footerOffset - contentHeight;
      if (viewportTop >= stopTopInDocument) {
        setStyle({
          position: "absolute",
          top: `${Math.max(0, stopTopInDocument - containerTop)}px`,
          width: "100%",
        });
        return;
      }

      setStyle({
        position: "fixed",
        top: `${topOffset}px`,
        left: `${containerRect.left}px`,
        width: `${containerRect.width}px`,
      });
    };

    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(schedule);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [topOffset, footerOffset]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={placeholderHeight > 0 ? { minHeight: `${placeholderHeight}px` } : undefined}
    >
      <div ref={contentRef} style={style}>
        {children}
      </div>
    </div>
  );
}
