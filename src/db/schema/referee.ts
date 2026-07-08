import { relations, sql } from "drizzle-orm";
import { check, integer, pgTable, text, unique } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { tournament } from "./tournament";
import { matchDay, timestamps } from "./columns.helpers";

export const referee = pgTable(
  "referee",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    profileId: integer("profile_id").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    preferredMatchDay: matchDay("preferred_match_day").notNull(),
    secondaryMatchDays: matchDay("secondary_match_day").array().notNull(),

    fideId: text("fide_id").notNull(),

    ...timestamps,
  },
  (table) => [
    unique().on(table.tournamentId, table.profileId),
    check(
      "referee_secondary_match_days_no_preferred",
      sql`NOT (${table.preferredMatchDay} = ANY(${table.secondaryMatchDays}))`,
    ),
  ],
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
