CREATE TYPE "public"."result" AS ENUM('draw', 'white_wins', 'black_wins');--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "result" "result";