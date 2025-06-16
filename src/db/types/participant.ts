import { InferSelectModel } from "drizzle-orm";
import { participant } from "../schema/participant";

export type Participant = InferSelectModel<typeof participant>;

export type ParticipantWithName = Participant & {
  profile: {
    lastName: string;
    firstName: string;
  };
};
