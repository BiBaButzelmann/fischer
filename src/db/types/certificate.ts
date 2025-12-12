import type { ParticipantWithName } from "./participant";

export type ParticipantWithPoints = ParticipantWithName & {
  points: number;
  gamesPlayed: number;
};

export type GroupWithTopParticipants = {
  id: number;
  groupName: string;
  topParticipants: ParticipantWithPoints[];
};
