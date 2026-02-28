CREATE TYPE "public"."property_request_review_status" AS ENUM('pending', 'approved', 'declined');--> statement-breakpoint
ALTER TABLE "property_requests"
  ADD COLUMN "review_status" "property_request_review_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint

UPDATE "property_requests"
SET "review_status" = CASE
  WHEN "description" IS NOT NULL
    AND "description" ~ '^\\s*\\{'
    AND (("description"::jsonb ->> 'review_status') IN ('pending', 'approved', 'declined'))
  THEN ("description"::jsonb ->> 'review_status')::property_request_review_status
  WHEN "description" IS NOT NULL
    AND "description" ~ '^\\s*\\{'
    AND ("description"::jsonb ->> 'approved_property_id') IS NOT NULL
  THEN 'approved'::property_request_review_status
  WHEN "description" IS NOT NULL
    AND "description" ~ '^\\s*\\{'
    AND ("description"::jsonb ->> 'declined_at') IS NOT NULL
  THEN 'declined'::property_request_review_status
  ELSE 'pending'::property_request_review_status
END;--> statement-breakpoint

UPDATE "property_requests"
SET "description" = (
  CASE
    WHEN "description" IS NOT NULL AND "description" ~ '^\\s*\\{'
    THEN (
      ("description"::jsonb) ||
      jsonb_build_object('review_status', to_jsonb("review_status"::text))
    )::text
    ELSE "description"
  END
) ;--> statement-breakpoint
