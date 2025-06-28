CREATE TYPE "public"."tournament_week_status" AS ENUM('regular', 'catch-up');--> statement-breakpoint
CREATE TABLE "tournament_week" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tournament_week_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tournament_id" integer NOT NULL,
	"status" "tournament_week_status" DEFAULT 'regular' NOT NULL,
	"week_number" smallint NOT NULL,
	"referee_needed_tuesday" boolean NOT NULL,
	"referee_needed_thursday" boolean NOT NULL,
	"referee_needed_saturday" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game" ALTER COLUMN "scheduled" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "pgn_id" integer;