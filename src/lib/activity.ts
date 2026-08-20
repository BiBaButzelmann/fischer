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
  const events: ActivityEvent[] = [];

  for (const account of input.accounts ?? []) {
    events.push({ type: "account_created", timestamp: account.createdAt });
  }

  for (const session of input.sessions ?? []) {
    events.push({ type: "login", timestamp: session.createdAt });
  }

  for (const registration of input.registrations ?? []) {
    events.push({
      type: "registered",
      timestamp: registration.createdAt,
      tournamentName: registration.tournamentName,
    });
  }

  for (const change of input.changes ?? []) {
    events.push({
      type: "updated",
      timestamp: change.createdAt,
      changes: change.changes,
      tournamentName: change.tournamentName,
    });
  }

  for (const view of input.pageViews ?? []) {
    events.push({
      type: "page_view",
      timestamp: view.createdAt,
      path: view.path,
    });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function computeParticipantChanges<T extends Record<string, unknown>>(
  oldValues: T,
  newValues: Partial<Record<keyof T, unknown>>,
  fields: (keyof T & string)[],
): ParticipantChanges {
  const changes: ParticipantChanges = {};

  for (const field of fields) {
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
