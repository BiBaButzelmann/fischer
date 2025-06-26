CREATE TABLE "pgn" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pgn" ADD CONSTRAINT "pgn_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pgn_game_id_unique" ON "pgn" USING btree ("game_id");--> statement-breakpoint
ALTER TABLE "game" DROP COLUMN "pgn_id";