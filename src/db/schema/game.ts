import { integer, pgEnum, pgTable, timestamp, date } from "drizzle-orm/pg-core";

export const resultEnum = pgEnum("result", [
  "draw", // 0
  "white_wins", // 1
  "black_wins", // 2
]);

export const game = pgTable("game", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  whitePlayerId: integer("white_player_id").notNull(),
  blackPlayerId: integer("black_player_id").notNull(),
  tournamentId: integer("tournament_id").notNull(),
  groupId: integer("group_id").notNull(),
  round: integer("round").notNull(),
  boardNumber: integer("board_number").notNull(),
  result: resultEnum(),
  pgnId: integer("pgn_id"),

  scheduled: date("scheduled", { mode: "date" }).notNull(),

  // TODO: cleanup - stop repeating these fields
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});
