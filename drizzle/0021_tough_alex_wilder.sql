ALTER TABLE "group" DROP CONSTRAINT "group_tournament_id_group_name_pk";--> statement-breakpoint
ALTER TABLE "group" ALTER COLUMN "group_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_tournament_id_group_number_pk" PRIMARY KEY("tournament_id","group_number");--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "group_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "group" DROP COLUMN "group_name2";