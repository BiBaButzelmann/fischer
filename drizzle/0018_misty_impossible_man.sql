CREATE TYPE "public"."academic_title" AS ENUM('Dr.');--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "academic_title" "academic_title";