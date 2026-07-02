-- Custom SQL migration file, put your code below! --

-- Data migration: correct the historical -1 day timezone shift on participant date-only columns.
-- Rows were written from browser-local-midnight JS Dates which drizzle serialised via
-- toISOString() (UTC), storing the previous calendar day. Shift every affected value +1 day.
-- matchday.date and tournament.*_date are NOT affected (written from day-time context /
-- date strings) and must not be touched.

UPDATE "participant"
SET "not_available_days" = (
  SELECT array_agg(DISTINCT "d" + 1)
  FROM unnest("not_available_days") AS "d"
)
WHERE cardinality("not_available_days") > 0;
--> statement-breakpoint
UPDATE "participant"
SET "birth_date" = "birth_date" + 1
WHERE "birth_date" IS NOT NULL;