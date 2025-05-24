import { drizzle } from "drizzle-orm/neon-http";
import * as usersSchema from "./user";

export const db = drizzle({
    schema: { ...usersSchema },
    connection: process.env.DATABASE_URL!,
});
