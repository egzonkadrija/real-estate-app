export const APP_NAME = "NovaBuildings";
export const APP_DESCRIPTION = "Find your dream property in North Macedonia";

export const PROPERTY_TYPES = ["sale", "rent"] as const;
export const PROPERTY_CATEGORIES = [
  "house",
  "apartment",
  "office",
  "land",
  "store",
  "warehouse",
  "penthouse",
  "object",
] as const;

export const PROPERTY_STATUSES = [
  "active",
  "pending",
  "sold",
  "rented",
] as const;

export const AMENITIES = [
  "parking",
  "elevator",
  "balcony",
  "garden",
  "pool",
  "gym",
  "security",
  "airConditioning",
  "heating",
  "furnished",
  "internet",
  "storage",
  "garage",
  "terrace",
  "basement",
  "fireplace",
] as const;

export const AMENITY_ICONS: Record<string, string> = {
  parking: "Car",
  elevator: "ArrowUpDown",
  balcony: "Fence",
  garden: "Trees",
  pool: "Waves",
  gym: "Dumbbell",
  security: "Shield",
  airConditioning: "Wind",
  heating: "Flame",
  furnished: "Sofa",
  internet: "Wifi",
  storage: "Archive",
  garage: "Warehouse",
  terrace: "Sun",
  basement: "ArrowDown",
  fireplace: "Flame",
};

export const PRICE_RANGES = {
  sale: [
    { min: 0, max: 30000, label: "< €30,000" },
    { min: 30000, max: 50000, label: "€30,000 - €50,000" },
    { min: 50000, max: 100000, label: "€50,000 - €100,000" },
    { min: 100000, max: 200000, label: "€100,000 - €200,000" },
    { min: 200000, max: 500000, label: "€200,000 - €500,000" },
    { min: 500000, max: 0, label: "> €500,000" },
  ],
  rent: [
    { min: 0, max: 200, label: "< €200" },
    { min: 200, max: 400, label: "€200 - €400" },
    { min: 400, max: 600, label: "€400 - €600" },
    { min: 600, max: 1000, label: "€600 - €1,000" },
    { min: 1000, max: 0, label: "> €1,000" },
  ],
};

export const ITEMS_PER_PAGE = 12;

export const LOCALES = ["mk", "al", "en", "de", "tr"] as const;
export type Locale = (typeof LOCALES)[number];

export const NORTH_MACEDONIA_CENTER = { lat: 41.9981, lng: 21.4254 };
export const DEFAULT_ZOOM = 9;
