import {
  integer,
  pgTable,
  primaryKey,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tournament } from "./tournament";
import { tournamentWeek } from "./tournamentWeek";
import { referee } from "./referee";
import { setupHelper } from "./setupHelper";
import { game } from "./game";
import { timestamps, matchDay } from "./columns.helpers";

export const matchday = pgTable("matchday", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  tournamentWeekId: integer("tournament_week_id").notNull(),
  date: date("date", { mode: "date" }).notNull(),
  dayOfWeek: matchDay("day_of_week").notNull(), // tuesday, thursday, friday
  refereeNeeded: boolean("referee_needed").notNull().default(true),

  ...timestamps,
});

export const matchdayReferee = pgTable(
  "matchday_referee",
  {
    matchdayId: integer("matchday_id").notNull(),
    refereeId: integer("referee_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.matchdayId, table.refereeId] })],
);

export const matchdaySetupHelper = pgTable(
  "matchday_setup_helper",
  {
    matchdayId: integer("matchday_id").notNull(),
    setupHelperId: integer("setup_helper_id").notNull(),
    canceled: boolean("canceled"),
  },
  (table) => [primaryKey({ columns: [table.matchdayId, table.setupHelperId] })],
);

export const matchdayGame = pgTable(
  "matchday_game",
  {
    matchdayId: integer("matchday_id").notNull(),
    gameId: integer("game_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.matchdayId, table.gameId] })],
);

export const matchdayRelations = relations(matchday, ({ one, many }) => ({
  tournament: one(tournament, {
    fields: [matchday.tournamentId],
    references: [tournament.id],
  }),
  tournamentWeek: one(tournamentWeek, {
    fields: [matchday.tournamentWeekId],
    references: [tournamentWeek.id],
  }),
  referees: one(matchdayReferee),
  setupHelpers: many(matchdaySetupHelper),
  games: many(matchdayGame),
}));

export const matchdayRefereeRelations = relations(
  matchdayReferee,
  ({ one }) => ({
    matchday: one(matchday, {
      fields: [matchdayReferee.matchdayId],
      references: [matchday.id],
    }),
    referee: one(referee, {
      fields: [matchdayReferee.refereeId],
      references: [referee.id],
    }),
  }),
);

export const matchdaySetupHelperRelations = relations(
  matchdaySetupHelper,
  ({ one }) => ({
    matchday: one(matchday, {
      fields: [matchdaySetupHelper.matchdayId],
      references: [matchday.id],
    }),
    setupHelper: one(setupHelper, {
      fields: [matchdaySetupHelper.setupHelperId],
      references: [setupHelper.id],
    }),
  }),
);

export const matchdayGameRelations = relations(matchdayGame, ({ one }) => ({
  matchday: one(matchday, {
    fields: [matchdayGame.matchdayId],
    references: [matchday.id],
  }),
  game: one(game, {
    fields: [matchdayGame.gameId],
    references: [game.id],
  }),
}));
