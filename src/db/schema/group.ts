import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { participant } from "./participant";

export const group = pgTable(
  "group",
  {
    id: integer("id").generatedAlwaysAsIdentity(),

    groupNumber: integer("group_number").notNull(),
    groupName: text("group_name").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.tournamentId, table.groupNumber] })],
);

export const groupRelations = relations(group, ({ many }) => ({
  participants: many(participant),
}));
