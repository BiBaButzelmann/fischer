import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth";
import * as profileSchema from "./schema/profile";
import * as tournamentSchema from "./schema/tournament";
import * as addressSchema from "./schema/address";

export const db = drizzle({
    schema: {
        ...authSchema,
        ...profileSchema,
        ...addressSchema,
        ...tournamentSchema,
    },
    connection: process.env.DATABASE_URL!,
});
