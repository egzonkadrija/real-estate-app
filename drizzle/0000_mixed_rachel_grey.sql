CREATE TYPE "public"."location_type" AS ENUM('state', 'city', 'neighborhood');--> statement-breakpoint
CREATE TYPE "public"."property_category" AS ENUM('house', 'apartment', 'office', 'land', 'store', 'warehouse', 'penthouse', 'object');--> statement-breakpoint
CREATE TYPE "public"."property_request_type" AS ENUM('buy', 'rent');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('active', 'pending', 'sold', 'rented');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"avatar" text,
	"bio_al" text,
	"bio_en" text,
	"bio_de" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "location_type" NOT NULL,
	"name_al" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_de" varchar(255) NOT NULL,
	"parent_id" integer,
	"slug" varchar(255) NOT NULL,
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_al" varchar(500) NOT NULL,
	"title_en" varchar(500) NOT NULL,
	"title_de" varchar(500) NOT NULL,
	"description_al" text NOT NULL,
	"description_en" text NOT NULL,
	"description_de" text NOT NULL,
	"type" "property_type" NOT NULL,
	"category" "property_category" NOT NULL,
	"price" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'EUR' NOT NULL,
	"surface_area" integer NOT NULL,
	"rooms" integer,
	"bathrooms" integer,
	"floor" integer,
	"year_built" integer,
	"latitude" real,
	"longitude" real,
	"location_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "property_status" DEFAULT 'active' NOT NULL,
	"amenities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt" varchar(255),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "property_request_type" NOT NULL,
	"category" varchar(50) NOT NULL,
	"min_price" integer,
	"max_price" integer,
	"location" varchar(255),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;