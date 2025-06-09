import { InferSelectModel } from "drizzle-orm";
import { tournament } from "../schema/tournament";

export type Tournament = InferSelectModel<typeof tournament>;
