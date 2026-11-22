import { Juror } from "./juror";
import { MatchEnteringHelper } from "./match-entering-helper";
import { Participant } from "./participant";
import { Referee } from "./referee";
import { SetupHelper } from "./setup-helper";
import { Trainer } from "./trainer";

export const tournamentRoles = [
  "participant",
  "referee",
  "juror",
  "matchEnteringHelper",
  "setupHelper",
  "trainer",
] as const;

export type TournamentRole = (typeof tournamentRoles)[number];

export type Role = TournamentRole | "admin";

export type RolesData = {
  participant: Participant | undefined;
  referee: Referee | undefined;
  matchEnteringHelper: MatchEnteringHelper | undefined;
  setupHelper: SetupHelper | undefined;
  juror: Juror | undefined;
  trainer: Trainer | undefined;
};

export function hasAnyRole(roles: RolesData): boolean {
  return Object.values(roles).filter((role) => role !== undefined).length > 0;
}
