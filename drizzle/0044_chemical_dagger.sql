ALTER TABLE "participant" ADD COLUMN "not_available_days" date[];--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "not_available_from_date";--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "not_available_to_date";