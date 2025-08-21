import { relations } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";
import { participant } from "./participant";
import { tournament } from "./tournament";
import { group } from "./group";
import { gameResult, timestamps } from "./columns.helpers";
import { pgn } from "./pgn";
import { matchdayGame } from "./matchday";

export const game = pgTable("game", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  whiteParticipantId: integer("white_player_id"),
  blackParticipantId: integer("black_player_id"),
  tournamentId: integer("tournament_id").notNull(),
  groupId: integer("group_id").notNull(),
  pgnId: integer("pgn_id"),
  round: integer("round").notNull(),
  boardNumber: integer("board_number"),

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
  pgn: one(pgn, {
    fields: [game.id],
    references: [pgn.gameId],
  }),
  matchdayGame: one(matchdayGame, {
    fields: [game.id],
    references: [matchdayGame.gameId],
  }),
}));
