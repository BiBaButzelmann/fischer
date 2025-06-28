import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  smallint,
} from "drizzle-orm/pg-core";
import { tournament } from "./tournament";

export const tournamentWeekStatus = pgEnum("tournament_week_status", [
  "regular",
  "catch-up",
]);

export const tournamentWeek = pgTable("tournament_week", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  status: tournamentWeekStatus("status").default("regular").notNull(),
  weekNumber: smallint("week_number").notNull(),
  refereeNeededTuesday: boolean("referee_needed_tuesday").notNull(),
  refereeNeededThursday: boolean("referee_needed_thursday").notNull(),
  refereeNeededFriday: boolean("referee_needed_saturday").notNull(),
});

export const tournamentWeekRelations = relations(tournamentWeek, ({ one }) => ({
  tournament: one(tournament, {
    fields: [tournamentWeek.tournamentId],
    references: [tournament.id],
  }),
}));
