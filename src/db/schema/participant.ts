import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  unique,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { matchDay, timestamps } from "./columns.helpers";
import { group } from "./group";

export const participant = pgTable(
  "participant",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    profileId: integer("profile_id").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    chessClub: text("chess_club").notNull(),
    title: text("title"),
    nationality: text("nationality"),
    dwzRating: integer("dwz_rating"),
    fideRating: integer("fide_rating"),
    birthYear: integer("birth_year"),
    fideId: text("fide_id"),
    zpsClubId: text("zps_club_id"),
    zpsPlayerId: text("zps_player_id"),

    preferredMatchDay: matchDay("preferred_match_day").notNull(),
    secondaryMatchDays: matchDay("secondary_match_days").array().notNull(),
    notAvailableDays: date("not_available_days", { mode: "date" }).array(),

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
  group: one(participantGroup, {
    fields: [participant.id],
    references: [participantGroup.participantId],
  }),
}));

export const participantGroup = pgTable(
  "participant_group",
  {
    groupId: integer("group_id").notNull(),
    participantId: integer("participant_id").notNull(),
    groupPosition: integer("group_position").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.groupId, table.participantId, table.groupPosition],
    }),
  ],
);

export const participantGroupRelations = relations(
  participantGroup,
  ({ one }) => ({
    participant: one(participant, {
      fields: [participantGroup.participantId],
      references: [participant.id],
    }),
    group: one(group, {
      fields: [participantGroup.groupId],
      references: [group.id],
    }),
  }),
);
