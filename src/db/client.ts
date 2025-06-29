import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth";
import * as profileSchema from "./schema/profile";
import * as tournamentSchema from "./schema/tournament";
import * as participantSchema from "./schema/participant";
import * as groupSchema from "./schema/group";
import * as gameSchema from "./schema/game";
import * as pgnSchema from "./schema/pgn";
import * as tournamentWeekSchema from "./schema/tournamentWeek";

export const db = drizzle({
  schema: {
    ...authSchema,
    ...profileSchema,
    ...tournamentSchema,
    ...participantSchema,
    ...groupSchema,
    ...gameSchema,
    ...pgnSchema,
    ...tournamentWeekSchema,
  },
  connection: process.env.DATABASE_URL!,
});
