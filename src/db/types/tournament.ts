import { InferSelectModel } from "drizzle-orm";
import { tournament } from "../schema/tournament";

export type Tournament = InferSelectModel<typeof tournament>;

export type TournamentStage = Tournament["stage"];

export type TournamentNames = Pick<
  Tournament,
  "id" | "name" | "numberOfRounds"
>;
