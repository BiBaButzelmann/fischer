import { InferEnum, InferSelectModel } from "drizzle-orm";
import { game } from "../schema/game";
import {
  ParticipantWithName,
  ParticipantWithRatingAndChessClub,
  ParticipantWithProfile,
} from "./participant";

export type Game = InferSelectModel<typeof game>;

export type GameWithParticipants = Game & {
  whiteParticipant: Pick<ParticipantWithName, "id" | "profile"> | null;
  blackParticipant: Pick<ParticipantWithName, "id" | "profile"> | null;
};

export type GameWithParticipantRatings = Pick<
  Game,
  "id" | "whiteParticipantId" | "blackParticipantId" | "result" | "round"
> & {
  whiteParticipant: ParticipantWithRatingAndChessClub;
  blackParticipant: ParticipantWithRatingAndChessClub;
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
    dwzRating: number | null;
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
    dwzRating: number | null;
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
  time: Date;
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

export type GameWithParticipantsAndPGNAndDate = GameWithParticipantsAndPGN & {
  tournament: {
    name: string;
    gameStartTime: string;
  };
  matchdayGame: {
    matchday: {
      date: Date;
    };
  };
};

export type GameWithParticipantsAndPGN = Game & {
  whiteParticipant: ParticipantWithName | null;
  blackParticipant: ParticipantWithName | null;
  pgn: {
    value: string;
  } | null;
};

export const PLAYED_GAME_RESULTS = ["1:0", "0:1", "½-½", "0-½", "½-0"] as const;

export type GameResult = InferEnum<typeof game.result>;
export type PlayedGameResult = (typeof PLAYED_GAME_RESULTS)[number];
