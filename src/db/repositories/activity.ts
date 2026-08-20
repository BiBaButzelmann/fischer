import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "../client";
import { session } from "../schema/auth";
import { profile } from "../schema/profile";
import { participant } from "../schema/participant";
import { participantChangeLog } from "../schema/participantChangeLog";
import { pageView } from "../schema/pageView";
import {
  buildActivityTimeline,
  type ActivityEvent,
  type ActivityEventType,
} from "@/lib/activity";

const DEFAULT_LIMIT = 200;

type ActivityFilter = {
  from?: Date;
  to?: Date;
  types?: ActivityEventType[];
  tournamentId?: number;
  limit?: number;
};

function wants(types: ActivityEventType[] | undefined, type: ActivityEventType) {
  return types == null || types.includes(type);
}

function inRange(date: Date, filter: ActivityFilter) {
  if (filter.from && date < filter.from) {
    return false;
  }
  if (filter.to && date > filter.to) {
    return false;
  }
  return true;
}

export async function getActivityTimelineForProfile(
  profileId: number,
  filter: ActivityFilter = {},
): Promise<{ events: ActivityEvent[]; truncated: boolean }> {
  const limit = filter.limit ?? DEFAULT_LIMIT;

  const profileRow = await db.query.profile.findFirst({
    where: and(eq(profile.id, profileId), isNull(profile.deletedAt)),
    columns: { userId: true, createdAt: true },
  });

  if (!profileRow) {
    return { events: [], truncated: false };
  }

  const dateBounds = (column: AnyPgColumn) =>
    and(
      filter.from ? gte(column, filter.from) : undefined,
      filter.to ? lte(column, filter.to) : undefined,
    );

  const [sessions, registrations, changes, pageViews] = await Promise.all([
    wants(filter.types, "login")
      ? db
          .select({ createdAt: session.createdAt })
          .from(session)
          .where(
            and(eq(session.userId, profileRow.userId), dateBounds(session.createdAt)),
          )
          .orderBy(desc(session.createdAt))
          .limit(limit + 1)
      : Promise.resolve([]),
    wants(filter.types, "registered")
      ? db
          .select({ createdAt: participant.createdAt })
          .from(participant)
          .where(
            and(
              eq(participant.profileId, profileId),
              isNull(participant.deletedAt),
              filter.tournamentId
                ? eq(participant.tournamentId, filter.tournamentId)
                : undefined,
              dateBounds(participant.createdAt),
            ),
          )
      : Promise.resolve([]),
    wants(filter.types, "updated")
      ? db
          .select({
            createdAt: participantChangeLog.createdAt,
            changes: participantChangeLog.changes,
          })
          .from(participantChangeLog)
          .where(
            and(
              eq(participantChangeLog.profileId, profileId),
              filter.tournamentId
                ? eq(participantChangeLog.tournamentId, filter.tournamentId)
                : undefined,
              dateBounds(participantChangeLog.createdAt),
            ),
          )
          .orderBy(desc(participantChangeLog.createdAt))
          .limit(limit + 1)
      : Promise.resolve([]),
    wants(filter.types, "page_view")
      ? db
          .select({ createdAt: pageView.createdAt, path: pageView.path })
          .from(pageView)
          .where(
            and(
              eq(pageView.userId, profileRow.userId),
              dateBounds(pageView.createdAt),
            ),
          )
          .orderBy(desc(pageView.createdAt))
          .limit(limit + 1)
      : Promise.resolve([]),
  ]);

  const truncated =
    sessions.length > limit ||
    changes.length > limit ||
    pageViews.length > limit;

  const events = buildActivityTimeline({
    accounts: wants(filter.types, "account_created")
      ? [{ createdAt: profileRow.createdAt }]
      : [],
    sessions: sessions.slice(0, limit),
    registrations,
    changes: changes.slice(0, limit),
    pageViews: pageViews.slice(0, limit),
  }).filter((event) => inRange(event.timestamp, filter));

  return { events, truncated };
}
