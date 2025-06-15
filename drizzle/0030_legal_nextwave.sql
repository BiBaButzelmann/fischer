ALTER TABLE "participant" ADD COLUMN "chess_club" text NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "preferred_match_day" "match_day" NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "secondary_match_days" "match_day"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "help_as_referee" "match_day"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "help_setup_room" "match_day"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "help_enter_matches" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "help_as_tournament_jury" boolean NOT NULL;