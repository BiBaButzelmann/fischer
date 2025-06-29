CREATE TABLE "juror" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "juror_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	CONSTRAINT "juror_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "match_entering_helper" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "match_entering_helper_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"number_of_groups_to_enter" smallint NOT NULL,
	CONSTRAINT "match_entering_helper_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "referee" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "referee_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"preferred_match_day" "match_day" NOT NULL,
	"secondary_match_day" "match_day"[] NOT NULL,
	CONSTRAINT "referee_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "setup_helper" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "setup_helper_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"preferred_match_day" "match_day" NOT NULL,
	"secondary_match_day" "match_day"[] NOT NULL,
	CONSTRAINT "setup_helper_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "entry_fee_payed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "help_as_referee";--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "help_setup_room";--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "help_enter_matches";--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "help_as_tournament_jury";