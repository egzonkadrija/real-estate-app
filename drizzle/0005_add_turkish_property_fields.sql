ALTER TABLE "properties"
  ADD COLUMN "title_tr" varchar(500),
  ADD COLUMN "description_tr" text;--> statement-breakpoint

UPDATE "properties"
SET
  "title_tr" = COALESCE(NULLIF("title_en", ''), "title_al", "title_de", "title_mk"),
  "description_tr" = COALESCE(NULLIF("description_en", ''), "description_al", "description_de", "description_mk")
WHERE "title_tr" IS NULL OR "description_tr" IS NULL;--> statement-breakpoint

ALTER TABLE "properties"
  ALTER COLUMN "title_tr" SET NOT NULL,
  ALTER COLUMN "description_tr" SET NOT NULL;--> statement-breakpoint
