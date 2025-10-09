CREATE TABLE "trainer" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trainer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"profile_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "trainer_tournament_id_profile_id_unique" UNIQUE("tournament_id","profile_id")
);
