DROP TABLE "address" CASCADE;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "co_line" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "street" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "postal_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "address_id";