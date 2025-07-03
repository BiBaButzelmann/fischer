import { InferSelectModel } from "drizzle-orm";
import { tournament, tournamentStage } from "../schema/tournament";

export type Tournament = InferSelectModel<typeof tournament>;

export type TournamentStage = (typeof tournamentStage.enumValues)[number];
