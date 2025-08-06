import { DayOfWeek } from "@/db/types/group";
import { ParticipantWithName } from "@/db/types/participant";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";

export type GridGroup = {
  id: number;
  isNew: boolean;
  groupNumber: number;
  groupName: string;
  dayOfWeek: DayOfWeek | null;
  participants: ParticipantWithName[];
  matchEnteringHelpers: MatchEnteringHelperWithName[];
};
