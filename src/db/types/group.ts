import { InferEnum, InferSelectModel } from "drizzle-orm";
import { group } from "../schema/group";
import { ParticipantWithName } from "./participant";

export type MatchDay = InferEnum<typeof group.matchDay>;

export type Group = InferSelectModel<typeof group>;

export type GroupWithParticipants = Group & {
  participants: ParticipantWithName[];
};
