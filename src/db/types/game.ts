import { InferEnum, InferSelectModel } from "drizzle-orm";
import { game } from "../schema/game";
import {
  ParticipantWithName,
  ParticipantWithRating,
  ParticipantWithProfile,
} from "./participant";

export type Game = InferSelectModel<typeof game>;

export type GameWithParticipants = Game & {
  whiteParticipant?: Pick<ParticipantWithName, "id" | "profile"> | null;
  blackParticipant?: Pick<ParticipantWithName, "id" | "profile"> | null;
};

export type GameWithParticipantRatings = Pick<
  Game,
  "id" | "whiteParticipantId" | "blackParticipantId" | "result" | "round"
> & {
  whiteParticipant: ParticipantWithRating;
  blackParticipant: ParticipantWithRating;
};

export type GameWithParticipantProfilesAndGroupAndMatchday = Game & {
  whiteParticipant: {
    profile: {
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
    fideRating: number | null;
  } | null;
  blackParticipant: {
    profile: {
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
    fideRating: number | null;
  } | null;
  group: {
    id: number;
    groupName: string;
    groupNumber: number;
  };
  matchdayGame: {
    matchday: {
      date: Date;
    };
  };
};

export type GameWithMatchday = Game & {
  matchdayGame: {
    matchday: {
      date: Date;
    };
  };
};

export type GameWithParticipantProfilesAndMatchday = Game & {
  whiteParticipant: ParticipantWithProfile | null;
  blackParticipant: ParticipantWithProfile | null;
  matchdayGame: {
    matchday: {
      date: Date;
    };
  };
};

export type GameWithParticipantsAndDate = GameWithParticipants & {
  matchdayGame: {
    matchday: {
      date: Date;
    };
  };
};

export type GameResult = InferEnum<typeof game.result>;
