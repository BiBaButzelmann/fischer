ALTER TABLE "game" ALTER COLUMN "result" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."result";--> statement-breakpoint
CREATE TYPE "public"."result" AS ENUM('1:0', '0:1', '½-½', '+:-', '-:+', '-:-', '0-½', '½-0');--> statement-breakpoint
ALTER TABLE "game" ALTER COLUMN "result" SET DATA TYPE "public"."result" USING "result"::"public"."result";