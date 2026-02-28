import { z } from "zod";
import {
  PROPERTY_CATEGORIES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from "@/lib/constants";

export const propertyTypeSchema = z.enum(PROPERTY_TYPES);
export const propertyCategorySchema = z.enum(PROPERTY_CATEGORIES);
export const propertyStatusSchema = z.enum(PROPERTY_STATUSES);

export type PropertyTypeValue = z.infer<typeof propertyTypeSchema>;
export type PropertyCategoryValue = z.infer<typeof propertyCategorySchema>;
export type PropertyStatusValue = z.infer<typeof propertyStatusSchema>;

export const propertyImageInputSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  sort_order: z.number().default(0),
  is_primary: z.boolean().default(false),
});

const basePropertySchemaShape = {
  title_al: z.string().min(1),
  title_en: z.string().min(1),
  title_de: z.string().min(1),
  description_al: z.string().default(""),
  description_en: z.string().default(""),
  description_de: z.string().default(""),
  type: propertyTypeSchema,
  category: propertyCategorySchema,
  price: z.number().positive(),
  currency: z.string().default("EUR"),
  surface_area: z.number().positive(),
  rooms: z.number().int().nullable().optional(),
  bathrooms: z.number().int().nullable().optional(),
  floor: z.number().int().nullable().optional(),
  year_built: z.number().int().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  location_id: z.number().int(),
  agent_id: z.number().int(),
  featured: z.boolean().default(false),
  status: propertyStatusSchema.default("active"),
  amenities: z.array(z.string()).default([]),
};

export const createPropertySchema = z.object({
  ...basePropertySchemaShape,
  images: z.array(propertyImageInputSchema).optional(),
});

export const updatePropertySchema = z.object({
  title_al: basePropertySchemaShape.title_al.optional(),
  title_en: basePropertySchemaShape.title_en.optional(),
  title_de: basePropertySchemaShape.title_de.optional(),
  description_al: z.string().optional(),
  description_en: z.string().optional(),
  description_de: z.string().optional(),
  type: propertyTypeSchema.optional(),
  category: propertyCategorySchema.optional(),
  price: basePropertySchemaShape.price.optional(),
  currency: z.string().optional(),
  surface_area: basePropertySchemaShape.surface_area.optional(),
  rooms: basePropertySchemaShape.rooms,
  bathrooms: basePropertySchemaShape.bathrooms,
  floor: basePropertySchemaShape.floor,
  year_built: basePropertySchemaShape.year_built,
  latitude: basePropertySchemaShape.latitude,
  longitude: basePropertySchemaShape.longitude,
  location_id: basePropertySchemaShape.location_id.optional(),
  agent_id: basePropertySchemaShape.agent_id.optional(),
  featured: z.boolean().optional(),
  status: propertyStatusSchema.optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(propertyImageInputSchema).optional(),
});

export function parsePropertyStatuses(
  rawStatuses: string | null
): PropertyStatusValue[] {
  if (!rawStatuses) return [];

  return rawStatuses
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is PropertyStatusValue =>
      (PROPERTY_STATUSES as readonly string[]).includes(item)
    );
}
