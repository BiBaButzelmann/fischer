import { ParticipantWithName } from "@/db/types/participant";

export type GridGroup = {
  id: number;
  groupNumber: number;
  groupName: string;
  participants: ParticipantWithName[];
  isNew: boolean;
};
