import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { participant } from "./participant";

export const profile = pgTable("profile", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull(),

  coLine: text("co_line"),
  street: text("street"),
  city: text("city"),
  postalCode: text("postal_code"),

  userId: text("user_id").notNull(),
  participantId: integer("participant_id"),

  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
  participant: one(participant, {
    fields: [profile.participantId],
    references: [participant.id],
  }),
}));
