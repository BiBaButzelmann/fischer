import { DayOfWeek } from "@/db/types/group";
import { ParticipantWithName } from "@/db/types/participant";

export type GridGroup = {
  id: number;
  isNew: boolean;
  groupNumber: number;
  groupName: string;
  matchDay: DayOfWeek | null;
  participants: ParticipantWithName[];
};
