ALTER TABLE "game" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "game_postponement" ADD COLUMN "postponed_by_profile_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "game_postponement" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "juror" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "match_entering_helper" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "pgn" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "referee" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "setup_helper" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "tournament" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "game_postponement" DROP COLUMN "postponed_by_user_id";--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "participant_id";