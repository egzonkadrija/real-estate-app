BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'location_type' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.location_type AS ENUM ('state', 'city', 'neighborhood');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'property_type' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.property_type AS ENUM ('sale', 'rent');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'property_category' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.property_category AS ENUM (
      'house',
      'apartment',
      'office',
      'land',
      'store',
      'warehouse',
      'penthouse',
      'object'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'property_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.property_status AS ENUM ('active', 'pending', 'sold', 'rented');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'property_request_type' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.property_request_type AS ENUM ('buy', 'rent');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'property_request_review_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.property_request_review_status AS ENUM ('pending', 'approved', 'declined');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.locations (
  id SERIAL PRIMARY KEY,
  type public.location_type NOT NULL,
  name_al VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_de VARCHAR(255) NOT NULL,
  parent_id INTEGER,
  slug VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  avatar TEXT,
  bio_al TEXT,
  bio_en TEXT,
  bio_de TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.properties (
  id SERIAL PRIMARY KEY,
  title_al VARCHAR(500) NOT NULL,
  title_en VARCHAR(500) NOT NULL,
  title_de VARCHAR(500) NOT NULL,
  description_al TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_de TEXT NOT NULL,
  type public.property_type NOT NULL,
  category public.property_category NOT NULL,
  price INTEGER NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  surface_area INTEGER NOT NULL,
  rooms INTEGER,
  bathrooms INTEGER,
  floor INTEGER,
  year_built INTEGER,
  latitude REAL,
  longitude REAL,
  location_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  status public.property_status NOT NULL DEFAULT 'active',
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT properties_location_id_fk
    FOREIGN KEY (location_id) REFERENCES public.locations (id),
  CONSTRAINT properties_agent_id_fk
    FOREIGN KEY (agent_id) REFERENCES public.agents (id)
);

CREATE TABLE IF NOT EXISTS public.property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT property_images_property_id_fk
    FOREIGN KEY (property_id) REFERENCES public.properties (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id SERIAL PRIMARY KEY,
  property_id INTEGER,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT contacts_property_id_fk
    FOREIGN KEY (property_id) REFERENCES public.properties (id)
);

CREATE TABLE IF NOT EXISTS public.property_requests (
  id SERIAL PRIMARY KEY,
  type public.property_request_type NOT NULL,
  category VARCHAR(50) NOT NULL,
  min_price INTEGER,
  max_price INTEGER,
  location VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  review_status public.property_request_review_status NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS locations_type_parent_name_en_idx
  ON public.locations (type, parent_id, name_en);

CREATE INDEX IF NOT EXISTS locations_lower_name_al_idx
  ON public.locations (lower(name_al));

CREATE INDEX IF NOT EXISTS locations_lower_name_en_idx
  ON public.locations (lower(name_en));

CREATE INDEX IF NOT EXISTS locations_lower_name_de_idx
  ON public.locations (lower(name_de));

CREATE INDEX IF NOT EXISTS agents_created_at_idx
  ON public.agents (created_at DESC);

CREATE INDEX IF NOT EXISTS properties_created_at_idx
  ON public.properties (created_at DESC);

CREATE INDEX IF NOT EXISTS properties_status_created_at_idx
  ON public.properties (status, created_at DESC);

CREATE INDEX IF NOT EXISTS properties_featured_status_created_at_idx
  ON public.properties (featured, status, created_at DESC);

CREATE INDEX IF NOT EXISTS properties_agent_created_at_idx
  ON public.properties (agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS properties_location_status_created_at_idx
  ON public.properties (location_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS properties_type_category_status_created_at_idx
  ON public.properties (type, category, status, created_at DESC);

CREATE INDEX IF NOT EXISTS properties_price_idx
  ON public.properties (price);

CREATE INDEX IF NOT EXISTS properties_surface_area_idx
  ON public.properties (surface_area);

CREATE INDEX IF NOT EXISTS properties_rooms_idx
  ON public.properties (rooms);


CREATE INDEX IF NOT EXISTS properties_lower_title_al_trgm_idx
  ON public.properties USING gin (lower(title_al) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS properties_lower_title_en_trgm_idx
  ON public.properties USING gin (lower(title_en) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS properties_lower_title_de_trgm_idx
  ON public.properties USING gin (lower(title_de) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS property_images_property_sort_idx
  ON public.property_images (property_id, sort_order, id);

CREATE INDEX IF NOT EXISTS contacts_is_read_created_at_idx
  ON public.contacts (is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS contacts_property_id_idx
  ON public.contacts (property_id);

CREATE INDEX IF NOT EXISTS property_requests_review_status_created_at_idx
  ON public.property_requests (review_status, created_at DESC);

CREATE INDEX IF NOT EXISTS property_requests_type_created_at_idx
  ON public.property_requests (type, created_at DESC);

CREATE INDEX IF NOT EXISTS property_requests_lower_name_trgm_idx
  ON public.property_requests USING gin (lower(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS property_requests_lower_email_trgm_idx
  ON public.property_requests USING gin (lower(email) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS property_requests_lower_phone_trgm_idx
  ON public.property_requests USING gin (lower(phone) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS property_requests_lower_location_trgm_idx
  ON public.property_requests USING gin (lower(location) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS property_requests_lower_category_trgm_idx
  ON public.property_requests USING gin (lower(category) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS property_requests_lower_description_trgm_idx
  ON public.property_requests USING gin (lower(COALESCE(description, '')) gin_trgm_ops);

COMMIT;
