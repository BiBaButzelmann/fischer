import { MatchDay } from "@/db/types/group";
import { ParticipantWithName } from "@/db/types/participant";

export type GridGroup = {
  id: number;
  groupNumber: number;
  groupName: string;
  matchDay: MatchDay | null;
  participants: ParticipantWithName[];
};
