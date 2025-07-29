import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as authSchema from "./schema/auth";
import * as profileSchema from "./schema/profile";
import * as tournamentSchema from "./schema/tournament";
import * as participantSchema from "./schema/participant";
import * as groupSchema from "./schema/group";
import * as gameSchema from "./schema/game";
import * as pgnSchema from "./schema/pgn";
import * as tournamentWeekSchema from "./schema/tournamentWeek";
import * as setupHelperSchema from "./schema/setupHelper";
import * as refereeSchema from "./schema/referee";
import * as jurorSchema from "./schema/juror";
import * as matchEnteringHelperSchema from "./schema/matchEnteringHelper";
import * as matchdaySchema from "./schema/matchday";
import * as gamePostponementSchema from "./schema/gamePostponement";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export const db = drizzle(pool, {
  schema: {
    ...authSchema,
    ...profileSchema,
    ...tournamentSchema,
    ...participantSchema,
    ...groupSchema,
    ...gameSchema,
    ...pgnSchema,
    ...tournamentWeekSchema,
    ...setupHelperSchema,
    ...refereeSchema,
    ...jurorSchema,
    ...matchEnteringHelperSchema,
    ...matchdaySchema,
    ...gamePostponementSchema,
  },
});
