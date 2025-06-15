import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { game } from "./game";
import { relations } from "drizzle-orm";
import { timestamps } from "./columns.helpers";

export const pgn = pgTable(
  "pgn",
  {
    id: serial("id").primaryKey(),

    /* each PGN must belong to exactly one game */
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id, { onDelete: "cascade" }),

    value: text("value").notNull(), // the full PGN blob

    ...timestamps,
  },
  (t) => ({
    /* enforce 1-to-1 */
    gameIdUnique: uniqueIndex("pgn_game_id_unique").on(t.gameId),
  }),
);

//relation to game
export const pgnRelations = relations(pgn, ({ one }) => ({
  game: one(game, {
    fields: [pgn.gameId],
    references: [game.id],
  }),
}));
