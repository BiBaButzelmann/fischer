import { InferSelectModel } from "drizzle-orm";
import { setupHelper } from "../schema/setupHelper";

export type SetupHelper = InferSelectModel<typeof setupHelper>;
