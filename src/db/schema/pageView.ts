import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";

export const pageView = pgTable("page_view", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

  userId: text("user_id").notNull(),
  path: text("path").notNull(),

  ...timestamps,
});
