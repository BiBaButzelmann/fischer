import { InferSelectModel } from "drizzle-orm";
import { matchday } from "../schema/matchday";
import { RefereeWithName } from "./referee";
import { TournamentWeek } from "./tournamentWeek";

export type MatchDay = InferSelectModel<typeof matchday>;

export type MatchDayWithReferee = MatchDay & {
  referee: RefereeWithName | null;
  tournamentWeek: TournamentWeek;
};
