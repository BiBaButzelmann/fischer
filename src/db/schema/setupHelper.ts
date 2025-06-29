import { relations } from "drizzle-orm";
import { integer, pgTable, unique } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { tournament } from "./tournament";
import { matchDay, timestamps } from "./columns.helpers";

export const setupHelper = pgTable(
  "setup_helper",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    profileId: integer("profile_id").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    preferredMatchDay: matchDay("preferred_match_day").notNull(),
    secondaryMatchDays: matchDay("secondary_match_day").array().notNull(),

    ...timestamps,
  },
  (table) => [unique().on(table.tournamentId, table.profileId)],
);

export const setupHelperRelations = relations(setupHelper, ({ one }) => ({
  profile: one(profile, {
    fields: [setupHelper.profileId],
    references: [profile.id],
  }),
  tournament: one(tournament, {
    fields: [setupHelper.tournamentId],
    references: [tournament.id],
  }),
}));
