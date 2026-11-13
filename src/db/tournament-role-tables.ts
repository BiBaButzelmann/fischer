import { juror } from "./schema/juror";
import { matchEnteringHelper } from "./schema/matchEnteringHelper";
import { participant } from "./schema/participant";
import { referee } from "./schema/referee";
import { setupHelper } from "./schema/setupHelper";
import { trainer } from "./schema/trainer";

export const tournamentRoleTables = [
  participant,
  referee,
  juror,
  setupHelper,
  matchEnteringHelper,
  trainer,
] as const;

export type TournamentRoleTable = (typeof tournamentRoleTables)[number];
