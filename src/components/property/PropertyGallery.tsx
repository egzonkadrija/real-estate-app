"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/types";

interface PropertyGalleryProps {
  images: PropertyImage[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-gray-100">
        <p className="text-gray-400">No images</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-gray-100">
        {/* Main Carousel */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {sorted.map((image) => (
              <div
                key={image.id}
                className="relative aspect-[16/9] min-w-0 flex-[0_0_100%]"
              >
                <Image
                  src={image.url}
                  alt={image.alt || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority={image.is_primary}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setFullscreen(true)}
          className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-sm text-white transition-colors hover:bg-black/80"
        >
          <Expand className="mr-1 inline h-4 w-4" />
          {selectedIndex + 1} / {sorted.length}
        </button>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {sorted.map((image, idx) => (
            <button
              key={image.id}
              onClick={() => scrollTo(idx)}
              className={cn(
                "relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                idx === selectedIndex
                  ? "border-blue-600"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image.url}
                alt={image.alt || ""}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="relative h-[80vh] w-[90vw]">
            <Image
              src={sorted[selectedIndex]?.url || ""}
              alt={sorted[selectedIndex]?.alt || ""}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <div className="absolute bottom-6 text-white">
            {selectedIndex + 1} / {sorted.length}
          </div>
        </div>
      )}
    </>
  );
}
