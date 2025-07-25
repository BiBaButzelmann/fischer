import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { participantGroup } from "./participant";
import { game } from "./game";
import { matchDay, timestamps } from "./columns.helpers";
import { tournament } from "./tournament";
import { groupMatchEnteringHelper as matchEnteringHelperGroup } from "./matchEnteringHelper";

export const group = pgTable(
  "group",
  {
    id: integer("id").generatedAlwaysAsIdentity(),

    groupNumber: integer("group_number").notNull(),
    groupName: text("group_name").notNull(),
    matchDay: matchDay("match_day"),
    tournamentId: integer("tournament_id").notNull(),

    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.tournamentId, table.groupNumber] })],
);

export const groupRelations = relations(group, ({ one, many }) => ({
  tournament: one(tournament, {
    fields: [group.tournamentId],
    references: [tournament.id],
  }),
  participants: many(participantGroup),
  matchEnteringHelpers: many(matchEnteringHelperGroup),
  games: many(game),
}));
