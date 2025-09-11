-- Convert boolean canceled_at columns to timestamp
-- Step 1: Drop existing boolean columns
ALTER TABLE "matchday_referee" DROP COLUMN "canceled_at";--> statement-breakpoint
ALTER TABLE "matchday_setup_helper" DROP COLUMN "canceled_at";--> statement-breakpoint

-- Step 2: Add new timestamp columns
ALTER TABLE "matchday_referee" ADD COLUMN "canceled_at" timestamp;--> statement-breakpoint
ALTER TABLE "matchday_setup_helper" ADD COLUMN "canceled_at" timestamp;