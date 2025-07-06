import { InferSelectModel } from "drizzle-orm";
import { tournamentWeek } from "../schema/tournamentWeek";

export type TournamentWeek = InferSelectModel<typeof tournamentWeek>;
