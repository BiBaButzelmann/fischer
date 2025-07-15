import { InferSelectModel } from "drizzle-orm";
import { matchday } from "../schema/matchday";

export type MatchDay = InferSelectModel<typeof matchday>;
