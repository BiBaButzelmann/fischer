import { Juror } from "./juror";
import {
  MatchEnteringHelper,
  MatchEnteringHelperWithAssignments,
} from "./match-entering-helper";
import { Participant, ParticipantWithGroup } from "./participant";
import { Referee, RefereeWithAssignments } from "./referee";
import { SetupHelper, SetupHelperWithAssignments } from "./setup-helper";

export type Role =
  | "admin"
  | "participant"
  | "referee"
  | "juror"
  | "matchEnteringHelper"
  | "setupHelper";

export type RunningRolesData = {
  participant: ParticipantWithGroup | undefined;
  referee: RefereeWithAssignments | undefined;
  matchEnteringHelper: MatchEnteringHelperWithAssignments | undefined;
  setupHelper: SetupHelperWithAssignments | undefined;
  juror: Juror | undefined;
};

export type RegistrationRolesData = {
  participant: Participant | undefined;
  referee: Referee | undefined;
  matchEnteringHelper: MatchEnteringHelper | undefined;
  setupHelper: SetupHelper | undefined;
  juror: Juror | undefined;
};

export function hasSelectedAtLeastOneRole(
  roles: RunningRolesData | RegistrationRolesData,
): boolean {
  return Object.values(roles).filter((role) => role !== undefined).length > 0;
}
