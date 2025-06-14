ALTER TABLE "group" ALTER COLUMN "match_day" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."match_day";--> statement-breakpoint
CREATE TYPE "public"."match_day" AS ENUM('tuesday', 'thursday', 'friday');--> statement-breakpoint
ALTER TABLE "group" ALTER COLUMN "match_day" SET DATA TYPE "public"."match_day" USING "match_day"::"public"."match_day";