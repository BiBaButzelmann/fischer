import { InferSelectModel } from "drizzle-orm";
import { trainer } from "../schema/trainer";

export type Trainer = InferSelectModel<typeof trainer>;