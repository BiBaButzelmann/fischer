import { integer, jsonb, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";

export type ParticipantChanges = Record<
  string,
  { old: unknown; new: unknown }
>;

export const participantChangeLog = pgTable("participant_change_log", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

  profileId: integer("profile_id").notNull(),
  tournamentId: integer("tournament_id").notNull(),
  changes: jsonb("changes").$type<ParticipantChanges>().notNull(),

  ...timestamps,
});
