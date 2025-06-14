import { InferSelectModel } from "drizzle-orm";
import { profile } from "../schema/profile";

export type Profile = InferSelectModel<typeof profile>;
