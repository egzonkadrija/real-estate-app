ALTER TABLE "properties"
  ADD COLUMN "title_mk" varchar(500),
  ADD COLUMN "description_mk" text;--> statement-breakpoint

UPDATE "properties"
SET
  "title_mk" = COALESCE(NULLIF("title_en", ''), "title_al", "title_de"),
  "description_mk" = COALESCE(NULLIF("description_en", ''), "description_al", "description_de")
WHERE "title_mk" IS NULL OR "description_mk" IS NULL;--> statement-breakpoint

ALTER TABLE "properties"
  ALTER COLUMN "title_mk" SET NOT NULL,
  ALTER COLUMN "description_mk" SET NOT NULL;--> statement-breakpoint
