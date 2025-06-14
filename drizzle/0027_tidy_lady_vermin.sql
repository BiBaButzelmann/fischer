ALTER TABLE "profile" ADD COLUMN "first_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "name";