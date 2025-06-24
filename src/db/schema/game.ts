import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, date } from "drizzle-orm/pg-core";
import { participant } from "./participant";
import { tournament } from "./tournament";
import { group } from "./group";
import { timestamps } from "./columns.helpers";

export const resultEnum = pgEnum("result", [
  "draw", // 0
  "white_wins", // 1
  "black_wins", // 2
  // TODO: nicht angetreten etc.
]);

export const game = pgTable("game", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  whiteParticipantId: integer("white_player_id").notNull(),
  blackParticipantId: integer("black_player_id").notNull(),
  tournamentId: integer("tournament_id").notNull(),
  groupId: integer("group_id").notNull(),

  round: integer("round").notNull(),
  boardNumber: integer("board_number").notNull(),
  // TODO: probably make this datetime instead of date
  scheduled: date("scheduled", { mode: "date" }).notNull(),

  result: resultEnum(),
  pgnId: integer("pgn_id"),

  ...timestamps,
});

export const gameRelations = relations(game, ({ one }) => ({
  whiteParticipant: one(participant, {
    fields: [game.whiteParticipantId],
    references: [participant.id],
    relationName: "whiteParticipant",
  }),
  blackParticipant: one(participant, {
    fields: [game.blackParticipantId],
    references: [participant.id],
    relationName: "blackParticipant",
  }),
  tournament: one(tournament, {
    fields: [game.tournamentId],
    references: [tournament.id],
  }),
  group: one(group, {
    fields: [game.groupId],
    references: [group.id],
  }),
}));
