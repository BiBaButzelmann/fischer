import type { ParticipantChanges } from "@/db/schema/participantChangeLog";

export const ACTIVITY_EVENT_TYPES = [
  "account_created",
  "login",
  "registered",
  "updated",
  "page_view",
] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export const ACTIVITY_EVENT_LABELS: Record<ActivityEventType, string> = {
  account_created: "Konto erstellt",
  login: "Login",
  registered: "Turnier angemeldet",
  updated: "Turnier-Daten geändert",
  page_view: "Seite geöffnet",
};

export type ActivityEvent = {
  type: ActivityEventType;
  timestamp: Date;
  path?: string;
  changes?: ParticipantChanges;
  tournamentName?: string;
};

export function buildActivityTimeline(input: {
  accounts?: { createdAt: Date }[];
  sessions?: { createdAt: Date }[];
  registrations?: { createdAt: Date; tournamentName?: string }[];
  changes?: {
    createdAt: Date;
    changes: ParticipantChanges;
    tournamentName?: string;
  }[];
  pageViews?: { createdAt: Date; path: string }[];
}): ActivityEvent[] {
  const events: ActivityEvent[] = [
    ...(input.accounts ?? []).map(
      ({ createdAt }): ActivityEvent => ({
        type: "account_created",
        timestamp: createdAt,
      }),
    ),
    ...(input.sessions ?? []).map(
      ({ createdAt }): ActivityEvent => ({ type: "login", timestamp: createdAt }),
    ),
    ...(input.registrations ?? []).map(
      ({ createdAt, tournamentName }): ActivityEvent => ({
        type: "registered",
        timestamp: createdAt,
        tournamentName,
      }),
    ),
    ...(input.changes ?? []).map(
      ({ createdAt, changes, tournamentName }): ActivityEvent => ({
        type: "updated",
        timestamp: createdAt,
        changes,
        tournamentName,
      }),
    ),
    ...(input.pageViews ?? []).map(
      ({ createdAt, path }): ActivityEvent => ({
        type: "page_view",
        timestamp: createdAt,
        path,
      }),
    ),
  ];

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function computeParticipantChanges(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
): ParticipantChanges {
  const changes: ParticipantChanges = {};

  for (const field of Object.keys(newValues)) {
    const oldValue = normalize(oldValues[field]);
    const newValue = normalize(newValues[field]);
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[field] = { old: oldValue, new: newValue };
    }
  }

  return changes;
}

function normalize(value: unknown): unknown {
  if (value == null) {
    return null;
  }
  if (Array.isArray(value)) {
    return [...value].sort();
  }
  return value;
}
