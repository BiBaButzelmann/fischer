import { InferEnum, InferSelectModel } from "drizzle-orm";
import { group } from "../schema/group";
import { ParticipantWithName } from "./participant";
import { GameWithParticipants, GameWithMatchday } from "./game";

export type DayOfWeek = InferEnum<typeof group.dayOfWeek>;

export type Group = InferSelectModel<typeof group>;

export type GroupWithParticipants = Group & {
  participants: ParticipantWithName[];
};

export type GroupWithGames = Group & {
  games: GameWithParticipants[];
};

export type GroupWithParticipantsAndGames = Group & {
  participants: ParticipantWithName[];
  games: GameWithMatchday[];
};

export type GroupSummary = {
  id: number;
  groupName: string;
};
