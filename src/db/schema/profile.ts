import { relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { address } from "./address";

export const profile = pgTable("profile", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull(),
  fideId: integer("fide_id"),

  userId: text("user_id"),
  addressId: integer("address_id"),
});

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
  address: one(address, {
    fields: [profile.addressId],
    references: [address.id],
  }),
}));
