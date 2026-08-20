import { authWithRedirect } from "@/auth/utils";
import { redirect } from "next/navigation";
import { tournamentPath } from "@/lib/navigation";
import { getAllProfiles } from "@/db/repositories/admin";
import {
  getAllTournaments,
  getTournamentBySlug,
} from "@/db/repositories/tournament";
import {
  getActivityTimelineForProfile,
  getRecentParticipantActivity,
} from "@/db/repositories/activity";
import {
  ACTIVITY_EVENT_LABELS,
  ACTIVITY_EVENT_TYPES,
  type ActivityEvent,
  type ActivityEventType,
} from "@/lib/activity";
import {
  formatEventDateTime,
  parseDateOnly,
  toDateOnly,
  todayDateOnly,
  toLocalDateTime,
} from "@/lib/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ActivityFilters } from "@/components/admin/activity-filters";

const OVERVIEW_TYPES: ActivityEventType[] = ["registered", "updated"];
const OVERVIEW_DEFAULT_WINDOW_DAYS = 30;

type SearchParams = {
  profileId?: string;
  tournamentId?: string;
  types?: string;
  from?: string;
  to?: string;
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await authWithRedirect();
  const { slug } = await params;

  if (session.user.role !== "admin") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const query = await searchParams;
  const profileId = query.profileId ? Number(query.profileId) : undefined;

  const [profiles, tournaments, slugTournament] = await Promise.all([
    getAllProfiles(),
    getAllTournaments(),
    getTournamentBySlug(slug),
  ]);

  const tournamentId =
    query.tournamentId === "all"
      ? undefined
      : query.tournamentId
        ? Number(query.tournamentId)
        : slugTournament?.id;

  const availableTypes: ActivityEventType[] =
    profileId != null ? [...ACTIVITY_EVENT_TYPES] : OVERVIEW_TYPES;
  const types = parseTypes(query.types, availableTypes);

  const fromIsDefault = profileId == null && !query.from;
  const from = fromIsDefault
    ? toDateOnlyMinusDays(OVERVIEW_DEFAULT_WINDOW_DAYS)
    : query.from;
  const to = query.to;

  const dateFilter = {
    from: from ? startOfDay(from) : undefined,
    to: to ? endOfDay(to) : undefined,
    types,
  };

  let events: ActivityEvent[];
  let truncated = false;
  if (profileId != null) {
    events = await getActivityTimelineForProfile(profileId, dateFilter);
  } else {
    const result = await getRecentParticipantActivity({
      ...dateFilter,
      tournamentId,
    });
    events = result.events;
    truncated = result.truncated;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Anmeldungsverlauf
        </h1>
        <p className="text-gray-600">
          Konto-, Login- und Klubturnier-Anmeldungsaktivität einsehen.
        </p>
      </div>

      <ActivityFilters
        profiles={profiles.map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
        }))}
        tournaments={tournaments.map((t) => ({ id: t.id, name: t.name }))}
        profileId={profileId}
        tournamentId={tournamentId}
        types={types}
        availableTypes={availableTypes}
        from={from}
        fromIsDefault={fromIsDefault}
        to={to}
      />

      {fromIsDefault ? (
        <p className="text-sm text-muted-foreground">
          Zeigt die letzten {OVERVIEW_DEFAULT_WINDOW_DAYS} Tage. Über
          &quot;Von&quot; lässt sich weiter in die Vergangenheit blicken.
        </p>
      ) : null}
      {truncated ? (
        <p className="text-sm text-muted-foreground">
          Es werden nur die zuletzt geänderten Anmeldungen angezeigt — bitte
          den Zeitraum oder das Turnier weiter eingrenzen.
        </p>
      ) : null}

      <ActivityTable events={events} showProfileColumn={profileId == null} />
    </div>
  );
}

function ActivityTable({
  events,
  showProfileColumn,
}: {
  events: ActivityEvent[];
  showProfileColumn: boolean;
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine Aktivität im gewählten Zeitraum.
      </p>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Zeitstempel</TableHead>
            <TableHead>Aktion</TableHead>
            {showProfileColumn ? <TableHead>Nutzer</TableHead> : null}
            <TableHead>Turnier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event, index) => (
            <TableRow key={`${event.type}-${event.timestamp.getTime()}-${index}`}>
              <TableCell className="whitespace-nowrap">
                {formatEventDateTime(toLocalDateTime(event.timestamp))}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {ACTIVITY_EVENT_LABELS[event.type]}
                </Badge>
              </TableCell>
              {showProfileColumn ? (
                <TableCell>{event.profileName ?? "–"}</TableCell>
              ) : null}
              <TableCell>{event.tournamentName ?? "–"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function parseTypes(
  raw: string | undefined,
  fallback: ActivityEventType[],
): ActivityEventType[] {
  if (!raw) {
    return fallback;
  }
  const requested = raw.split(",");
  const valid = fallback.filter((type) => requested.includes(type));
  return valid.length > 0 ? valid : fallback;
}

function toDateOnlyMinusDays(days: number): string {
  return toDateOnly(parseDateOnly(todayDateOnly()).minus({ days }));
}

function startOfDay(dateOnly: string): Date {
  return parseDateOnly(dateOnly).startOf("day").toJSDate();
}

function endOfDay(dateOnly: string): Date {
  return parseDateOnly(dateOnly).endOf("day").toJSDate();
}
