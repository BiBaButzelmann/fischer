import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const address = pgTable("address", {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    name: text("name").notNull(),
    coLine: text("co_line"),
    street: text("street").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),

    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
});
