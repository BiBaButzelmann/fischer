import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, unique } from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { group } from "./group";
import { matchDay, timestamps } from "./columns.helpers";

export const participant = pgTable(
  "participant",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    profileId: integer("profile_id").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    groupId: integer("group_id"),
    groupPosition: integer("group_position"),

    chessClub: text("chess_club").notNull(),
    title: text("title"),
    nationality: text("nationality"),
    dwzRating: integer("dwz_rating"),
    fideRating: integer("fide_rating"),
    fideId: text("fide_id"),

    preferredMatchDay: matchDay("preferred_match_day").notNull(),
    secondaryMatchDays: matchDay("secondary_match_days").array().notNull(),

    entryFeePayed: boolean("entry_fee_payed"),

    ...timestamps,
  },
  (table) => [unique().on(table.tournamentId, table.profileId)],
);

export const participantRelations = relations(participant, ({ one }) => ({
  profile: one(profile, {
    fields: [participant.profileId],
    references: [profile.id],
  }),
  group: one(group, {
    fields: [participant.groupId],
    references: [group.id],
  }),
}));
