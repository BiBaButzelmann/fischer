import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth";

export const db = drizzle({
    schema: { ...authSchema },
    connection: process.env.DATABASE_URL!,
});
