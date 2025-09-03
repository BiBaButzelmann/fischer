import { InferSelectModel } from "drizzle-orm";
import { participant } from "../schema/participant";
import { DayOfWeek } from "./group";
import { ProfileWithName } from "./profile";

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

export type ParticipantWithRatingAndChessClub = Pick<
  Participant,
  "id" | "dwzRating" | "fideRating" | "title" | "chessClub"
> & {
  profile: {
    firstName: string;
    lastName: string;
  };
};

export type ParticipantWithRating = Pick<
  Participant,
  "id" | "dwzRating" | "fideRating"
> & {
  profile: ProfileWithName;
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
