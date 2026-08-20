export const ACTIVITY_EVENT_TYPES = [
  "account_created",
  "login",
  "registered",
  "updated",
] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export const ACTIVITY_EVENT_LABELS: Record<ActivityEventType, string> = {
  account_created: "Konto erstellt",
  login: "Login",
  registered: "Turnier angemeldet",
  updated: "Turnier-Daten geändert",
};

export type ActivityEvent = {
  type: ActivityEventType;
  timestamp: Date;
  profileName?: string;
};

// A participant row's updatedAt is set to (roughly) createdAt on insert, so a
// gap below this threshold means "never actually edited", not "edited
// instantly after registering".
const MIN_EDIT_GAP_MS = 1000;

export function buildActivityTimeline(input: {
  accounts?: { createdAt: Date; profileName?: string }[];
  sessions?: { createdAt: Date; profileName?: string }[];
  participants?: {
    createdAt: Date;
    updatedAt: Date;
    profileName?: string;
  }[];
}): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const account of input.accounts ?? []) {
    events.push({
      type: "account_created",
      timestamp: account.createdAt,
      profileName: account.profileName,
    });
  }

  for (const session of input.sessions ?? []) {
    events.push({
      type: "login",
      timestamp: session.createdAt,
      profileName: session.profileName,
    });
  }

  for (const p of input.participants ?? []) {
    events.push({
      type: "registered",
      timestamp: p.createdAt,
      profileName: p.profileName,
    });

    if (p.updatedAt.getTime() - p.createdAt.getTime() > MIN_EDIT_GAP_MS) {
      events.push({
        type: "updated",
        timestamp: p.updatedAt,
        profileName: p.profileName,
      });
    }
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
