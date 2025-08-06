import { InferSelectModel } from "drizzle-orm";
import { matchday } from "../schema/matchday";
import { RefereeWithName } from "./referee";
import { SetupHelperWithName } from "./setup-helper";
import { TournamentWeek } from "./tournamentWeek";

export type MatchDay = InferSelectModel<typeof matchday>;

export type MatchDayWithRefereeAndSetupHelpers = MatchDay & {
  referee: RefereeWithName | null;
  setupHelpers: {
    setupHelper: SetupHelperWithName;
  }[];
  tournamentWeek: TournamentWeek;
};
