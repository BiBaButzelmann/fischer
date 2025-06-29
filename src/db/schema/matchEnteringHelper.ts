import { relations } from "drizzle-orm";
import { integer, pgTable, smallint, unique } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { tournament } from "./tournament";

export const matchEnteringHelper = pgTable(
  "match_entering_helper",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    profileId: integer("profile_id").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    numberOfGroupsToEnter: smallint("number_of_groups_to_enter").notNull(),
  },
  (table) => [unique().on(table.tournamentId, table.profileId)],
);

export const matchEnteringHelperRelations = relations(matchEnteringHelper, ({ one }) => ({
  profile: one(profile, {
    fields: [matchEnteringHelper.profileId],
    references: [profile.id],
  }),
  tournament: one(tournament, {
    fields: [matchEnteringHelper.tournamentId],
    references: [tournament.id],
  }),
}));
