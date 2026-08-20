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
  detail?: string;
  tournamentName?: string;
  profileName?: string;
};

// A participant row's updatedAt is set to (roughly) createdAt on insert, so a
// gap below this threshold means "never actually edited", not "edited
// instantly after registering".
const MIN_EDIT_GAP_MS = 1000;

export function buildActivityTimeline(input: {
  accountCreatedAt?: Date | null;
  sessions: { createdAt: Date; ipAddress: string | null; userAgent: string | null }[];
  participants: {
    createdAt: Date;
    updatedAt: Date;
    tournamentName: string;
    profileName?: string;
  }[];
}): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  if (input.accountCreatedAt) {
    events.push({ type: "account_created", timestamp: input.accountCreatedAt });
  }

  for (const session of input.sessions) {
    const detailParts = [session.ipAddress, session.userAgent].filter(
      (part): part is string => Boolean(part),
    );
    events.push({
      type: "login",
      timestamp: session.createdAt,
      detail: detailParts.length > 0 ? detailParts.join(" · ") : undefined,
    });
  }

  for (const p of input.participants) {
    events.push({
      type: "registered",
      timestamp: p.createdAt,
      tournamentName: p.tournamentName,
      profileName: p.profileName,
    });

    if (p.updatedAt.getTime() - p.createdAt.getTime() > MIN_EDIT_GAP_MS) {
      events.push({
        type: "updated",
        timestamp: p.updatedAt,
        tournamentName: p.tournamentName,
        profileName: p.profileName,
      });
    }
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
