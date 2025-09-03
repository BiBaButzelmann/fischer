import { InferSelectModel } from "drizzle-orm";
import { participant } from "../schema/participant";
import { DayOfWeek } from "./group";

export type Participant = InferSelectModel<typeof participant>;

export type ParticipantWithName = Participant & {
  profile: {
    firstName: string;
    lastName: string;
  };
};

export type ParticipantAndGroup = Participant & {
  group?: {
    group: {
      id: number;
      groupName: string;
      dayOfWeek: DayOfWeek | null;
    };
  } | null;
};

export type ParticipantWithRating = Pick<
  Participant,
  "id" | "dwzRating" | "fideRating" | "title" | "chessClub"
> & {
  profile: {
    firstName: string;
    lastName: string;
  };
};

export type ParticipantWithProfile = Participant & {
  profile: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
};

export type ParticipantWithZps = Pick<
  Participant,
  "id" | "dwzRating" | "fideRating" | "zpsPlayerId"
> & {
  profile: {
    id: number;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    deletedAt: Date | null;
  };
};
