import { ParticipantWithRating } from "./participant";

export type PlayerStanding = {
  participant: ParticipantWithRating;
  points: number;
  gamesPlayed: number;
  sonnebornBerger: number;
};

export type PlayerStats = {
  participantId: number;
  points: number;
  gamesPlayed: number;
  sonnebornBerger: number;
};
