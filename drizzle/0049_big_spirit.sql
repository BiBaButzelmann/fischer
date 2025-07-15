CREATE TABLE "matchday" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "matchday_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tournament_id" integer NOT NULL,
	"tournament_week_id" integer NOT NULL,
	"date" date NOT NULL,
	"match_day" "match_day" NOT NULL,
	"referee_id" integer,
	"referee_needed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "matchday_game" (
	"matchday_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	CONSTRAINT "matchday_game_matchday_id_game_id_pk" PRIMARY KEY("matchday_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "matchday_setup_helper" (
	"matchday_id" integer NOT NULL,
	"setup_helper_id" integer NOT NULL,
	CONSTRAINT "matchday_setup_helper_matchday_id_setup_helper_id_pk" PRIMARY KEY("matchday_id","setup_helper_id")
);
--> statement-breakpoint
ALTER TABLE "tournament_week" DROP COLUMN "referee_needed_tuesday";--> statement-breakpoint
ALTER TABLE "tournament_week" DROP COLUMN "referee_needed_thursday";--> statement-breakpoint
ALTER TABLE "tournament_week" DROP COLUMN "referee_needed_friday";