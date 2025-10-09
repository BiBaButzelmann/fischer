import { relations } from "drizzle-orm";
import { integer, pgTable, unique } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { tournament } from "./tournament";
import { timestamps } from "./columns.helpers";

export const trainer = pgTable(
  "trainer",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    profileId: integer("profile_id").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    ...timestamps,
  },
  (table) => [unique().on(table.tournamentId, table.profileId)],
);

export const trainerRelations = relations(trainer, ({ one }) => ({
  profile: one(profile, {
    fields: [trainer.profileId],
    references: [profile.id],
  }),
  tournament: one(tournament, {
    fields: [trainer.tournamentId],
    references: [tournament.id],
  }),
}));