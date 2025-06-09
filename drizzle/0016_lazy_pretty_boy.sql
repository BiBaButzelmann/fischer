ALTER TABLE "group" ADD CONSTRAINT "group_tournament_id_group_name_pk" PRIMARY KEY("tournament_id","group_name");--> statement-breakpoint
ALTER TABLE "group" DROP COLUMN "id";