import { InferEnum, InferSelectModel } from "drizzle-orm";
import { game } from "../schema/game";
import { ParticipantWithName } from "./participant";
import { gameResult } from "../schema/columns.helpers";

export type Game = InferSelectModel<typeof game>;
export type GameWithParticipants = Game & {
  whiteParticipant: ParticipantWithName;
  blackParticipant: ParticipantWithName;
};
export type GameWithParticipantNamesAndRatings = Game & {
  whiteParticipant: {
    profile: {
      userId: string;
      firstName: string;
      lastName: string;
    };
    fideRating: number | null;
  };
  blackParticipant: {
    profile: {
      userId: string;
      firstName: string;
      lastName: string;
    };
    fideRating: number | null;
  };
};

export type GameResult = InferEnum<typeof game.result>;
