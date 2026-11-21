import { juror } from "./schema/juror";
import { matchEnteringHelper } from "./schema/matchEnteringHelper";
import { participant } from "./schema/participant";
import { referee } from "./schema/referee";
import { setupHelper } from "./schema/setupHelper";
import { trainer } from "./schema/trainer";
import { TournamentRole } from "./types/role";

export const tournamentRoleTables = {
  participant,
  referee,
  juror,
  matchEnteringHelper,
  setupHelper,
  trainer,
} satisfies Record<TournamentRole, unknown>;

export type TournamentRoleTable = (typeof tournamentRoleTables)[TournamentRole];
