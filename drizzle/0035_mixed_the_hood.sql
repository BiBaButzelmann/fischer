ALTER TABLE "participant" ALTER COLUMN "entry_fee_payed" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "participant" ALTER COLUMN "entry_fee_payed" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "juror" ADD COLUMN "created_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "juror" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "match_entering_helper" ADD COLUMN "group_id" integer;--> statement-breakpoint
ALTER TABLE "match_entering_helper" ADD COLUMN "created_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "match_entering_helper" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "referee" ADD COLUMN "created_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "referee" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "setup_helper" ADD COLUMN "created_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "setup_helper" ADD COLUMN "updated_at" timestamp NOT NULL;