import { InferSelectModel } from "drizzle-orm";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";

export type MatchEnteringHelper = InferSelectModel<typeof matchEnteringHelper>;
