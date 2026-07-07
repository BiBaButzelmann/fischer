-- Data cleanup: drop the preferred match day from the secondary match days so the
-- CHECK constraints below can be added. Runs first, otherwise ADD CONSTRAINT fails
-- on existing rows where preferred and secondary overlap.
UPDATE "participant"
SET "secondary_match_days" = array_remove("secondary_match_days", "preferred_match_day")
WHERE "preferred_match_day" = ANY("secondary_match_days");
--> statement-breakpoint
UPDATE "referee"
SET "secondary_match_day" = array_remove("secondary_match_day", "preferred_match_day")
WHERE "preferred_match_day" = ANY("secondary_match_day");
--> statement-breakpoint
UPDATE "setup_helper"
SET "secondary_match_day" = array_remove("secondary_match_day", "preferred_match_day")
WHERE "preferred_match_day" = ANY("secondary_match_day");
--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_secondary_match_days_no_preferred" CHECK (NOT ("participant"."preferred_match_day" = ANY("participant"."secondary_match_days")));--> statement-breakpoint
ALTER TABLE "referee" ADD CONSTRAINT "referee_secondary_match_days_no_preferred" CHECK (NOT ("referee"."preferred_match_day" = ANY("referee"."secondary_match_day")));--> statement-breakpoint
ALTER TABLE "setup_helper" ADD CONSTRAINT "setup_helper_secondary_match_days_no_preferred" CHECK (NOT ("setup_helper"."preferred_match_day" = ANY("setup_helper"."secondary_match_day")));
