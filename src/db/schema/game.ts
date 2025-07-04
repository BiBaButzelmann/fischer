import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, timestamp } from "drizzle-orm/pg-core";
import { participant } from "./participant";
import { tournament } from "./tournament";
import { group } from "./group";
import { gameResult, timestamps } from "./columns.helpers";
import { pgn } from "./pgn";

export const game = pgTable("game", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  whiteParticipantId: integer("white_player_id").notNull(),
  blackParticipantId: integer("black_player_id").notNull(),
  tournamentId: integer("tournament_id").notNull(),
  groupId: integer("group_id").notNull(),
  pgnId: integer("pgn_id"),
  round: integer("round").notNull(),
  boardNumber: integer("board_number").notNull(),
  scheduled: timestamp("scheduled", {
    mode: "date",
    withTimezone: true,
  }).notNull(),

  result: gameResult(),

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
  //relation to pgn table
  pgn: one(pgn, {
    fields: [game.id],
    references: [pgn.gameId],
  }),
}));
