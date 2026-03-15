ALTER TABLE "locations"
  ADD COLUMN "name_tr" varchar(255);--> statement-breakpoint

UPDATE "locations"
SET "name_tr" = COALESCE(NULLIF("name_en", ''), "name_al", "name_de", "name_mk")
WHERE "name_tr" IS NULL;--> statement-breakpoint

ALTER TABLE "locations"
  ALTER COLUMN "name_tr" SET NOT NULL;--> statement-breakpoint
