import { relations } from "drizzle-orm";
import { integer, pgTable, unique } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { tournament } from "./tournament";
import { matchDay } from "./columns.helpers";

export const referee = pgTable(
  "referee",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    profileId: integer("profile_id").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    preferredMatchDay: matchDay("preferred_match_day").notNull(),
    secondaryMatchDays: matchDay("secondary_match_day").array().notNull(),
  },
  (table) => [unique().on(table.tournamentId, table.profileId)],
);

export const refereeRelations = relations(referee, ({ one }) => ({
  profile: one(profile, {
    fields: [referee.profileId],
    references: [profile.id],
  }),
  tournament: one(tournament, {
    fields: [referee.tournamentId],
    references: [tournament.id],
  }),
}));
