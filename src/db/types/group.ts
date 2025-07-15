import { InferEnum, InferSelectModel } from "drizzle-orm";
import { group } from "../schema/group";
import { ParticipantWithName } from "./participant";
import { GameWithParticipants, Game } from "./game";

export type MatchDay = InferEnum<typeof group.matchDay>;

export type Group = InferSelectModel<typeof group>;

export type GroupWithParticipants = Group & {
  participants: ParticipantWithName[];
};

export type GroupWithGames = Group & {
  games: GameWithParticipants[];
};

export type GroupWithParticipantsAndGames = Group & {
  participants: ParticipantWithName[];
  games: Game[];
};
