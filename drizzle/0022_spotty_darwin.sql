ALTER TABLE "group" ADD COLUMN "tier" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "exercise_promotion_right" boolean;