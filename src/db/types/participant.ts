import { InferSelectModel } from "drizzle-orm";
import { participant } from "../schema/participant";
import type { getParticipantsByGroupId } from "../repositories/participant";

export type Participant = InferSelectModel<typeof participant>;

export type ParticipantWithName = Participant & {
  profile: {
    firstName: string;
    lastName: string;
  };
};

export type ParticipantSummary = Awaited<
  ReturnType<typeof getParticipantsByGroupId>
>[0];
