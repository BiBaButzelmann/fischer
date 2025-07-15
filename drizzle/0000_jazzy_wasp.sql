DO $$
BEGIN
    CREATE TYPE "public"."result" AS ENUM('draw', 'white_wins', 'black_wins');
	CREATE TYPE "public"."match_day" AS ENUM('tuesday', 'thursday', 'friday');
	CREATE TYPE "public"."tournament_stage" AS ENUM('registration', 'running', 'done');
	CREATE TYPE "public"."tournament_week_status" AS ENUM('regular', 'catch-up');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "game_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"white_player_id" integer NOT NULL,
	"black_player_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	"pgn_id" integer,
	"round" integer NOT NULL,
	"board_number" integer NOT NULL,
	"scheduled" timestamp with time zone NOT NULL,
	"result" "result",
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_postponement" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "game_postponement_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"game_id" integer NOT NULL,
	"postponing_participant_id" integer NOT NULL,
	"postponed_by_profile_id" integer NOT NULL,
	"from" timestamp with time zone NOT NULL,
	"to" timestamp with time zone NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group" (
	"id" integer GENERATED ALWAYS AS IDENTITY (sequence name "group_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"group_number" integer NOT NULL,
	"group_name" text NOT NULL,
	"match_day" "match_day",
	"tournament_id" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "group_tournament_id_group_number_pk" PRIMARY KEY("tournament_id","group_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "juror" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "juror_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "juror_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_entering_helper" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "match_entering_helper_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"group_id" integer,
	"number_of_groups_to_enter" smallint NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "match_entering_helper_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matchday" (
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
CREATE TABLE IF NOT EXISTS "matchday_game" (
	"matchday_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	CONSTRAINT "matchday_game_matchday_id_game_id_pk" PRIMARY KEY("matchday_id","game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matchday_setup_helper" (
	"matchday_id" integer NOT NULL,
	"setup_helper_id" integer NOT NULL,
	CONSTRAINT "matchday_setup_helper_matchday_id_setup_helper_id_pk" PRIMARY KEY("matchday_id","setup_helper_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participant" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "participant_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"group_id" integer,
	"group_position" integer,
	"chess_club" text NOT NULL,
	"title" text,
	"nationality" text,
	"dwz_rating" integer,
	"fide_rating" integer,
	"birth_year" integer,
	"fide_id" text,
	"zps_club_id" text,
	"zps_player_id" text,
	"preferred_match_day" "match_day" NOT NULL,
	"secondary_match_days" "match_day"[] NOT NULL,
	"not_available_days" date[],
	"entry_fee_payed" boolean,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "participant_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pgn" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "profile_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "profile_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referee" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "referee_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"preferred_match_day" "match_day" NOT NULL,
	"secondary_match_day" "match_day"[] NOT NULL,
	"fide_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "referee_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "setup_helper" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "setup_helper_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"preferred_match_day" "match_day" NOT NULL,
	"secondary_match_day" "match_day"[] NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "setup_helper_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tournament" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tournament_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organizer" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"number_of_rounds" smallint NOT NULL,
	"end_registration_date" date NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"time_limit" text NOT NULL,
	"location" text NOT NULL,
	"all_clocks_digital" boolean NOT NULL,
	"tie_break_method" text NOT NULL,
	"software" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"stage" "tournament_stage" DEFAULT 'registration' NOT NULL,
	"pgn_viewer_password" text NOT NULL,
	"organizer_profile_id" integer,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tournament_week" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tournament_week_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tournament_id" integer NOT NULL,
	"status" "tournament_week_status" DEFAULT 'regular' NOT NULL,
	"week_number" smallint NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_user_id_user_id_fk') THEN
        ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_user_id_user_id_fk') THEN
        ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pgn_game_id_game_id_fk') THEN
        ALTER TABLE "pgn" ADD CONSTRAINT "pgn_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'pgn_game_id_unique') THEN
        CREATE UNIQUE INDEX "pgn_game_id_unique" ON "pgn" USING btree ("game_id");
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;