import { Juror } from "./juror";
import {
  MatchEnteringHelper,
  MatchEnteringHelperWithAssignments,
} from "./match-entering-helper";
import { Participant, ParticipantAndGroup } from "./participant";
import { Referee } from "./referee";
import {
  RefereeWithAssignments,
  SetupHelperWithAssignments,
} from "@/components/uebersicht/running/types";
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

export type AssignmentData = {
  participant: ParticipantAndGroup | undefined;
  referee: RefereeWithAssignments | undefined;
  matchEnteringHelper: MatchEnteringHelperWithAssignments | undefined;
  setupHelper: SetupHelperWithAssignments | undefined;
  juror: Juror | undefined;
};

export function hasSelectedAtLeastOneRole(
  roles: RolesData | AssignmentData,
): boolean {
  return Object.values(roles).filter((role) => role !== undefined).length > 0;
}
