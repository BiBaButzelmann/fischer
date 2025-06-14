import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth";
import * as profileSchema from "./schema/profile";
import * as tournamentSchema from "./schema/tournament";
import * as participantSchema from "./schema/participant";
import * as groupSchema from "./schema/group";
import * as gameSchema from "./schema/game";

export const db = drizzle({
  schema: {
    ...authSchema,
    ...profileSchema,
    ...tournamentSchema,
    ...participantSchema,
    ...groupSchema,
    ...gameSchema,
  },
  connection: process.env.DATABASE_URL!,
});
