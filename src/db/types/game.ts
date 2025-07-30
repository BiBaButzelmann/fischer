import { InferEnum, InferSelectModel } from "drizzle-orm";
import { game } from "../schema/game";
import { ParticipantWithName, ParticipantWithRating } from "./participant";

export type Game = InferSelectModel<typeof game>;

export type GameWithParticipants = Game & {
  whiteParticipant: ParticipantWithName;
  blackParticipant: ParticipantWithName;
};

export type GameWithParticipantRatings = Pick<
  Game,
  "id" | "whiteParticipantId" | "blackParticipantId" | "result" | "round"
> & {
  whiteParticipant: ParticipantWithRating;
  blackParticipant: ParticipantWithRating;
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

export type GameWithMatchday = Game & {
  matchdayGame: {
    matchday: {
      date: Date;
    };
  };
};

export type GameResult = InferEnum<typeof game.result>;
