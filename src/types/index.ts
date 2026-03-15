export type PropertyType = "sale" | "rent";
export type PropertyCategory =
  | "house"
  | "apartment"
  | "office"
  | "land"
  | "store"
  | "warehouse"
  | "penthouse"
  | "object";
export type PropertyStatus = "active" | "pending" | "sold" | "rented";
export type LocationType = "state" | "city" | "neighborhood";

export interface PropertyImage {
  id: number;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export interface Location {
  id: number;
  type: LocationType;
  name_al: string;
  name_en: string;
  name_de: string;
  name_mk: string;
  name_tr: string;
  parent_id: number | null;
  slug: string;
}

export interface Property {
  id: number;
  title_al: string;
  title_en: string;
  title_de: string;
  title_mk: string;
  title_tr: string;
  description_al: string;
  description_en: string;
  description_de: string;
  description_mk: string;
  description_tr: string;
  type: PropertyType;
  category: PropertyCategory;
  price: number;
  currency: string;
  surface_area: number;
  rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  year_built: number | null;
  latitude: number | null;
  longitude: number | null;
  location_id: number;
  agent_id: number;
  featured: boolean;
  status: PropertyStatus;
  amenities: string[];
  created_at: Date;
  updated_at: Date;
  images?: PropertyImage[];
  agent?: Agent;
  location?: Location;
}

export interface PropertyFilters {
  type?: PropertyType;
  category?: PropertyCategory;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  locationId?: number;
  rooms?: number;
  page?: number;
  limit?: number;
  featured?: boolean;
  status?: PropertyStatus;
}

export interface Contact {
  id: number;
  property_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: Date;
  is_read: boolean;
}

export interface PropertyRequest {
  id: number;
  type: PropertyType;
  category: string;
  min_price: number | null;
  max_price: number | null;
  location: string | null;
  name: string;
  email: string;
  phone: string | null;
  description: string | null;
  created_at: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
