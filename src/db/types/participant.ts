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
      groupName: string;
      dayOfWeek: DayOfWeek | null;
    };
  } | null;
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
