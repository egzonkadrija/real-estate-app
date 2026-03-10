import type { PropertyCategory } from "@/types";

const CATEGORIES_WITHOUT_FLOOR = new Set<PropertyCategory>([
  "land",
  "warehouse",
  "object",
]);

const CATEGORIES_WITHOUT_ROOM_AND_BATHROOMS = new Set<PropertyCategory>([
  "land",
  "warehouse",
  "object",
]);

export function supportsFloorField(category: string | null | undefined): boolean {
  if (!category) return true;

  return !CATEGORIES_WITHOUT_FLOOR.has(category as PropertyCategory);
}

export function supportsRoomsField(category: string | null | undefined): boolean {
  if (!category) return true;

  return !CATEGORIES_WITHOUT_ROOM_AND_BATHROOMS.has(category as PropertyCategory);
}

export function supportsBathroomsField(category: string | null | undefined): boolean {
  if (!category) return true;

  return !CATEGORIES_WITHOUT_ROOM_AND_BATHROOMS.has(category as PropertyCategory);
}

export function getFloorLabelKey(category: string | null | undefined): "property.floor" | "property.houseFloors" {
  return category === "house" ? "property.houseFloors" : "property.floor";
}
