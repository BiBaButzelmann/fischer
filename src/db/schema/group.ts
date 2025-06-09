import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { participant } from "./participant";

export const group = pgTable("group", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  groupNumber: integer("group_name").notNull(),
  tournamentId: integer("tournament_id").notNull(),

  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const groupRelations = relations(group, ({ many }) => ({
  participants: many(participant),
}));
