import type { Participant } from "./participant";
import type { Game } from "./game";

export type PlayerStanding = {
  participantId: number;
  name: string;
  title: string | null;
  dwz: number | null;
  elo: number | null;
  points: number;
  gamesPlayed: number;
  sonnebornBerger: number;
};

export type ParticipantWithRating = Pick<
  Participant,
  "id" | "dwzRating" | "fideRating" | "title"
> & {
  profile: {
    firstName: string;
    lastName: string;
  };
};

export type GameWithParticipants = Pick<
  Game,
  "id" | "whiteParticipantId" | "blackParticipantId" | "result" | "round"
> & {
  whiteParticipant: ParticipantWithRating;
  blackParticipant: ParticipantWithRating;
};
