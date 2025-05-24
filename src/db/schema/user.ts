import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    email: varchar().notNull().unique(),
    password: varchar("password").notNull(),
});
