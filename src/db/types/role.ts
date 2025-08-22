import { Juror } from "./juror";
import { MatchEnteringHelper } from "./match-entering-helper";
import { Participant } from "./participant";
import { Referee } from "./referee";
import { SetupHelper } from "./setup-helper";

export type Role =
  | "admin"
  | "participant"
  | "referee"
  | "juror"
  | "matchEnteringHelper"
  | "setupHelper";

export type RolesData = {
  participant: Participant | undefined;
  referee: Referee | undefined;
  matchEnteringHelper: MatchEnteringHelper | undefined;
  setupHelper: SetupHelper | undefined;
  juror: Juror | undefined;
};

export function hasAnyRole(roles: RolesData): boolean {
  return Object.values(roles).filter((role) => role !== undefined).length > 0;
}
