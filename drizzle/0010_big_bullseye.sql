CREATE TABLE "matchday_referee" (
	"matchday_id" integer NOT NULL,
	"referee_id" integer NOT NULL,
	CONSTRAINT "matchday_referee_matchday_id_referee_id_pk" PRIMARY KEY("matchday_id","referee_id")
);
--> statement-breakpoint
ALTER TABLE "matchday" DROP COLUMN "referee_id";