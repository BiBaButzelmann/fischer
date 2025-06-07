import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { profile } from "./profile";

export const participant = pgTable("participant", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

  profileId: integer("profile_id").notNull(),
  tournamentId: integer("tournament_id").notNull(),

  fideId: text("fide_id"),

  fideRating: integer("fide_rating"),
  dwzRating: integer("dwz_rating"),

  // TODO: aufbauhelfer, schiedsrichter, etc.

  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const participantRelations = relations(participant, ({ one }) => ({
  profile: one(profile, {
    fields: [participant.profileId],
    references: [profile.id],
  }),
}));
