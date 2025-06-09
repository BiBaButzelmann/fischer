CREATE TYPE "public"."match_day" AS ENUM('monday', 'tuesday', 'thursday', 'friday');--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "match_day" "match_day";