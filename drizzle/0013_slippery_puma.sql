CREATE TABLE "participant" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "participant_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"fide_id" text,
	"fide_rating" integer,
	"dwz_rating" integer,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
DROP TABLE "player" CASCADE;