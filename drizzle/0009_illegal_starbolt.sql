CREATE TABLE "player" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "player_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"fide_rating" integer,
	"dwz_rating" integer,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL
);
