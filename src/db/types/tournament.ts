import { InferSelectModel } from "drizzle-orm";
import { tournament } from "../schema/tournament";
import { Group } from "./group";

export type Tournament = InferSelectModel<typeof tournament>;

export type TournamentWithGroups = Tournament & {
  groups: Group[];
};

export type TournamentStage = Tournament["stage"];
