import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, smallint } from "drizzle-orm/pg-core";
import { tournament } from "./tournament";
import { matchday } from "./matchday";

export const tournamentWeekStatus = pgEnum("tournament_week_status", [
  "regular",
  "catch-up",
]);

export const tournamentWeek = pgTable("tournament_week", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  status: tournamentWeekStatus("status").default("regular").notNull(),
  weekNumber: smallint("week_number").notNull(),
});

export const tournamentWeekRelations = relations(
  tournamentWeek,
  ({ one, many }) => ({
    tournament: one(tournament, {
      fields: [tournamentWeek.tournamentId],
      references: [tournament.id],
    }),
    matchdays: many(matchday),
  }),
);
