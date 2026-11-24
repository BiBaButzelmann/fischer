-- Normalizes stored FIDE IDs to trimmed values and blanks to NULL. Runs before
-- the CHECK constraint, otherwise ADD CONSTRAINT fails on these rows. Idempotent.
UPDATE "participant" SET "fide_id" = NULLIF(btrim("fide_id"), '')
WHERE "fide_id" <> btrim("fide_id") OR "fide_id" = '';
--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_fide_id_trimmed" CHECK ("participant"."fide_id" = btrim("participant"."fide_id") AND "participant"."fide_id" <> '');
