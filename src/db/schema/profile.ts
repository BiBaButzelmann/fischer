import { relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { participant } from "./participant";
import { timestamps } from "./columns.helpers";

export const profile = pgTable("profile", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number"),

  userId: text("user_id").notNull(),
  participantId: integer("participant_id"),

  ...timestamps,
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
