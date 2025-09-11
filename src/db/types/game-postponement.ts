import { InferSelectModel } from "drizzle-orm";
import { gamePostponement } from "../schema/gamePostponement";
import { ParticipantWithName } from "./participant";

export type GamePostponement = InferSelectModel<typeof gamePostponement>;

export type GamePostponementWithDetails = GamePostponement & {
  game: {
    id: number;
    round: number;
    whiteParticipant: ParticipantWithName | null;
    blackParticipant: ParticipantWithName | null;
    group: {
      id: number;
      groupName: string;
    };
    matchdayGame: {
      matchday: {
        id: number;
        date: Date;
      };
    } | null;
  };
  participant: ParticipantWithName;
  postponedByProfile: {
    id: number;
    firstName: string;
    lastName: string;
  };
};
