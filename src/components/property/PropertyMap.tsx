"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./PropertyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-100">
      <p className="text-sm text-gray-400">...</p>
    </div>
  ),
});

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  zoom?: number;
  className?: string;
}

export function PropertyMap(props: PropertyMapProps) {
  return <MapInner {...props} />;
}
