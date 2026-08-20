import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "../client";
import { session } from "../schema/auth";
import { profile } from "../schema/profile";
import { participant } from "../schema/participant";
import { tournament } from "../schema/tournament";
import {
  buildActivityTimeline,
  type ActivityEvent,
  type ActivityEventType,
} from "@/lib/activity";

const DEFAULT_RECENT_LIMIT = 200;

type ActivityFilter = {
  from?: Date;
  to?: Date;
  types?: ActivityEventType[];
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
): Promise<ActivityEvent[]> {
  const profileRow = await db.query.profile.findFirst({
    where: and(eq(profile.id, profileId), isNull(profile.deletedAt)),
    columns: { userId: true, createdAt: true },
  });

  if (!profileRow) {
    return [];
  }

  const wantsParticipants =
    wants(filter.types, "registered") || wants(filter.types, "updated");

  const [sessions, participants] = await Promise.all([
    wants(filter.types, "login")
      ? db.query.session.findMany({
          where: and(
            eq(session.userId, profileRow.userId),
            filter.from ? gte(session.createdAt, filter.from) : undefined,
            filter.to ? lte(session.createdAt, filter.to) : undefined,
          ),
          columns: { createdAt: true },
        })
      : Promise.resolve([]),
    wantsParticipants
      ? db
          .select({
            createdAt: participant.createdAt,
            updatedAt: participant.updatedAt,
            tournamentName: tournament.name,
          })
          .from(participant)
          .innerJoin(tournament, eq(participant.tournamentId, tournament.id))
          // a row can be relevant via either its create or its update
          // timestamp, so the date filter is applied per-event below
          // instead of narrowing this query
          .where(
            and(
              eq(participant.profileId, profileId),
              isNull(participant.deletedAt),
            ),
          )
      : Promise.resolve([]),
  ]);

  return buildActivityTimeline({
    accountCreatedAt: wants(filter.types, "account_created")
      ? profileRow.createdAt
      : null,
    sessions,
    participants,
  }).filter(
    (event) => wants(filter.types, event.type) && inRange(event.timestamp, filter),
  );
}

export async function getRecentParticipantActivity(
  filter: ActivityFilter & { tournamentId?: number; limit?: number } = {},
): Promise<{ events: ActivityEvent[]; truncated: boolean }> {
  const limit = filter.limit ?? DEFAULT_RECENT_LIMIT;

  const rows = await db
    .select({
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
      tournamentName: tournament.name,
      firstName: profile.firstName,
      lastName: profile.lastName,
    })
    .from(participant)
    .innerJoin(tournament, eq(participant.tournamentId, tournament.id))
    .innerJoin(profile, eq(participant.profileId, profile.id))
    .where(
      and(
        isNull(participant.deletedAt),
        isNull(profile.deletedAt),
        filter.tournamentId
          ? eq(participant.tournamentId, filter.tournamentId)
          : undefined,
        filter.from ? gte(participant.updatedAt, filter.from) : undefined,
        // bound by createdAt, not updatedAt: a row edited after "to" must
        // still contribute its in-range "registered" event
        filter.to ? lte(participant.createdAt, filter.to) : undefined,
      ),
    )
    .orderBy(desc(participant.updatedAt))
    .limit(limit + 1);

  const truncated = rows.length > limit;

  const events = buildActivityTimeline({
    sessions: [],
    participants: rows.slice(0, limit).map((r) => ({
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      tournamentName: r.tournamentName,
      profileName: `${r.firstName} ${r.lastName}`,
    })),
  }).filter(
    (event) => wants(filter.types, event.type) && inRange(event.timestamp, filter),
  );

  return { events, truncated };
}
