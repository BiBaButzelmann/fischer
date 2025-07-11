import { InferSelectModel } from "drizzle-orm";
import { referee } from "../schema/referee";

export type Referee = InferSelectModel<typeof referee>;
