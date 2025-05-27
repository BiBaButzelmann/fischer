import { InferSelectModel } from "drizzle-orm";
import { profile } from "../schema/profile";

export type SelectProfile = InferSelectModel<typeof profile>;
