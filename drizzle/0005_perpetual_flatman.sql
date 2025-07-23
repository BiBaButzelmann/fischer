CREATE TABLE "participant_group" (
	"group_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"group_position" integer NOT NULL,
	CONSTRAINT "participant_group_group_id_participant_id_pk" PRIMARY KEY("group_id","participant_id")
);
--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "group_id";--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "group_position";