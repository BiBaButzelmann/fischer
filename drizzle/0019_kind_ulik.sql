ALTER TABLE "tournament" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "tournament" SET "slug" = 'klubturnier-2025' WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "tournament" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_slug_unique" UNIQUE("slug");
