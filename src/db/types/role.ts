import { Juror } from "./juror";
import { MatchEnteringHelperWithAssignments } from "./match-entering-helper";
import { Participant } from "./participant";
import { RefereeWithAssignments } from "./referee";
import { SetupHelperWithAssignments } from "./setup-helper";

export type Role =
  | "admin"
  | "participant"
  | "referee"
  | "juror"
  | "matchEnteringHelper"
  | "setupHelper";

export type RolesData = {
  participant: Participant | undefined;
  referee: RefereeWithAssignments | undefined;
  matchEnteringHelper: MatchEnteringHelperWithAssignments | undefined;
  setupHelper: SetupHelperWithAssignments | undefined;
  juror: Juror | undefined;
};

export function hasSelectedAtLeastOneRole(roles: RolesData): boolean {
  return Object.values(roles).filter((role) => role !== undefined).length > 0;
}
