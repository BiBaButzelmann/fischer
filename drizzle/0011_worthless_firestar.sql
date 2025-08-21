CREATE TYPE "public"."gender" AS ENUM('m', 'f');--> statement-breakpoint
ALTER TABLE "game" ALTER COLUMN "white_player_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "game" ALTER COLUMN "black_player_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "gender" "gender" DEFAULT 'm';