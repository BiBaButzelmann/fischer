import { InferSelectModel } from "drizzle-orm";
import { game } from "../schema/game";
import { Participant, ParticipantWithName } from "./participant";

export type Game = InferSelectModel<typeof game>;
export type GameWithParticipants = Game & {
  whiteParticipant: ParticipantWithName;
  blackParticipant: ParticipantWithName;
};
