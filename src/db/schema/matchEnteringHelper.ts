import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  smallint,
  unique,
} from "drizzle-orm/pg-core";
import { profile } from "./profile";
import { tournament } from "./tournament";
import { timestamps } from "./columns.helpers";
import { group } from "./group";

export const matchEnteringHelper = pgTable(
  "match_entering_helper",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    profileId: integer("profile_id").notNull(),
    tournamentId: integer("tournament_id").notNull(),

    numberOfGroupsToEnter: smallint("number_of_groups_to_enter").notNull(),

    ...timestamps,
  },
  (table) => [unique().on(table.tournamentId, table.profileId)],
);

export const matchEnteringHelperRelations = relations(
  matchEnteringHelper,
  ({ one, many }) => ({
    profile: one(profile, {
      fields: [matchEnteringHelper.profileId],
      references: [profile.id],
    }),
    tournament: one(tournament, {
      fields: [matchEnteringHelper.tournamentId],
      references: [tournament.id],
    }),
    groups: many(groupMatchEnteringHelper),
  }),
);

export const groupMatchEnteringHelper = pgTable(
  "group_match_entering_helper",
  {
    groupId: integer("group_id").notNull(),
    matchEnteringHelperId: integer("match_entering_helper_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.groupId, table.matchEnteringHelperId] }),
  ],
);

export const matchEnteringHelperGroupRelations = relations(
  groupMatchEnteringHelper,
  ({ one }) => ({
    group: one(group, {
      fields: [groupMatchEnteringHelper.groupId],
      references: [group.id],
    }),
    matchEnteringHelper: one(matchEnteringHelper, {
      fields: [groupMatchEnteringHelper.matchEnteringHelperId],
      references: [matchEnteringHelper.id],
    }),
  }),
);
