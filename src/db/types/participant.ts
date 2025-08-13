import { InferSelectModel } from "drizzle-orm";
import { participant } from "../schema/participant";

export type Participant = InferSelectModel<typeof participant>;

export type ParticipantWithName = Participant & {
  profile: {
    firstName: string;
    lastName: string;
  };
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

export type ParticipantWithProfile = Participant & {
  profile: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
};
