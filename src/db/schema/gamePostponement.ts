import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";
import { participant } from "./participant";
import { profile } from "./profile";
import { game } from "./game";

export const gamePostponement = pgTable("game_postponement", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  gameId: integer("game_id").notNull(),
  postponingParticipantId: integer("postponing_participant_id").notNull(),
  postponedByProfileId: integer("postponed_by_user_id").notNull(),
  from: timestamp("from", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  to: timestamp("to", {
    mode: "date",
    withTimezone: true,
  }).notNull(),

  ...timestamps,
});

export const gamePostponementRelations = relations(
  gamePostponement,
  ({ one }) => ({
    participant: one(participant, {
      fields: [gamePostponement.postponingParticipantId],
      references: [participant.id],
    }),
    postponedByProfile: one(profile, {
      fields: [gamePostponement.postponedByProfileId],
      references: [profile.id],
    }),
    game: one(game, {
      fields: [gamePostponement.gameId],
      references: [game.id],
    }),
  }),
);
