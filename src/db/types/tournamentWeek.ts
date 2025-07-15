import { InferSelectModel } from "drizzle-orm";
import { tournamentWeek } from "../schema/tournamentWeek";
import { MatchDay } from "./match-day";

export type TournamentWeek = InferSelectModel<typeof tournamentWeek>;

export type TournamentWeekWithMatchdays = TournamentWeek & {
  matchdays: MatchDay[];
};
