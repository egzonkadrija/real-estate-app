ALTER TABLE "locations"
  ADD COLUMN "name_mk" varchar(255);--> statement-breakpoint

UPDATE "locations"
SET "name_mk" = COALESCE(NULLIF("name_en", ''), "name_al", "name_de")
WHERE "name_mk" IS NULL;--> statement-breakpoint

ALTER TABLE "locations"
  ALTER COLUMN "name_mk" SET NOT NULL;--> statement-breakpoint
