import { InferSelectModel } from "drizzle-orm";
import { juror } from "../schema/juror";

export type Juror = InferSelectModel<typeof juror>;
