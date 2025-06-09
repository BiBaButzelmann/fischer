ALTER TABLE "profile" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "participant_id" integer;