import { relations } from "drizzle-orm";
import { integer, pgTable, unique } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { tournament } from "./tournament";
import { timestamps } from "./columns.helpers";

export const juror = pgTable(
  "juror",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    profileId: integer("profile_id").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    ...timestamps,
  },
  (table) => [unique().on(table.tournamentId, table.profileId)],
);

export const jurorRelations = relations(juror, ({ one }) => ({
  profile: one(profile, {
    fields: [juror.profileId],
    references: [profile.id],
  }),
  tournament: one(tournament, {
    fields: [juror.tournamentId],
    references: [tournament.id],
  }),
}));
