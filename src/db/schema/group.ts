import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { participant } from "./participant";
import { game } from "./game";
import { matchDay, timestamps } from "./columns.helpers";

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

export const groupRelations = relations(group, ({ many }) => ({
  participants: many(participant),
  games: many(game),
}));
