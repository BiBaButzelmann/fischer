import { InferSelectModel } from "drizzle-orm";
import { tournament } from "../schema/tournament";
import { Group } from "./group";
import type { getAllActiveTournamentNames } from "../repositories/tournament";

export type Tournament = InferSelectModel<typeof tournament>;

export type TournamentWithGroups = Tournament & {
  groups: Group[];
};

export type TournamentStage = Tournament["stage"];

export type TournamentSummary = Awaited<
  ReturnType<typeof getAllActiveTournamentNames>
>[0];
