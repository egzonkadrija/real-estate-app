"use client";

import {
  Car,
  ArrowUpDown,
  Fence,
  Trees,
  Waves,
  Dumbbell,
  Shield,
  Wind,
  Flame,
  Sofa,
  Wifi,
  Archive,
  Warehouse,
  Sun,
  ArrowDown,
  LucideIcon,
} from "lucide-react";

const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  parking: Car,
  elevator: ArrowUpDown,
  balcony: Fence,
  garden: Trees,
  pool: Waves,
  gym: Dumbbell,
  security: Shield,
  airConditioning: Wind,
  heating: Flame,
  furnished: Sofa,
  internet: Wifi,
  storage: Archive,
  garage: Warehouse,
  terrace: Sun,
  basement: ArrowDown,
  fireplace: Flame,
};

const AMENITY_LABELS: Record<string, string> = {
  parking: "Parking",
  elevator: "Elevator",
  balcony: "Balcony",
  garden: "Garden",
  pool: "Pool",
  gym: "Gym",
  security: "Security",
  airConditioning: "AC",
  heating: "Heating",
  furnished: "Furnished",
  internet: "Internet",
  storage: "Storage",
  garage: "Garage",
  terrace: "Terrace",
  basement: "Basement",
  fireplace: "Fireplace",
};

interface AmenityBadgeProps {
  amenity: string;
}

export function AmenityBadge({ amenity }: AmenityBadgeProps) {
  const Icon = AMENITY_ICON_MAP[amenity];
  const label = AMENITY_LABELS[amenity] || amenity;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-500" />}
      {label}
    </span>
  );
}
