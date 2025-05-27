import { InferSelectModel } from "drizzle-orm";
import { address } from "../schema/address";

export type SelectAddress = InferSelectModel<typeof address>;
