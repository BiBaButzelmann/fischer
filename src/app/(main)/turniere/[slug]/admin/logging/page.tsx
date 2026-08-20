import { authWithRedirect } from "@/auth/utils";
import { redirect } from "next/navigation";
import { tournamentPath } from "@/lib/navigation";
import { getAllProfiles } from "@/db/repositories/admin";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import {
  getActivityTimelineForProfile,
  getRecentActivity,
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

const OVERVIEW_DEFAULT_TYPES: ActivityEventType[] = ["registered", "updated"];

type SearchParams = {
  profileId?: string;
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

  const [profiles, tournament] = await Promise.all([
    getAllProfiles(),
    getTournamentBySlug(slug),
  ]);

  const availableTypes: ActivityEventType[] = [...ACTIVITY_EVENT_TYPES];
  const defaultTypes =
    profileId != null ? availableTypes : OVERVIEW_DEFAULT_TYPES;
  const types = parseTypes(query.types, availableTypes, defaultTypes);

  const from = query.from;
  const to = query.to;

  const filter = {
    from: from ? startOfDay(from) : undefined,
    to: to ? endOfDay(to) : undefined,
    types,
    tournamentId: tournament?.id,
  };

  let events: ActivityEvent[];
  let truncated = false;
  if (profileId != null) {
    events = await getActivityTimelineForProfile(profileId, filter);
  } else {
    const result = await getRecentActivity(filter);
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
          Konto-, Login- und Anmeldungsaktivität für das aktuelle Turnier
          einsehen{tournament ? (
            <>
              : <strong>{tournament.name}</strong>
            </>
          ) : null}
        </p>
      </div>

      <ActivityFilters
        profiles={profiles.map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
        }))}
        profileId={profileId}
        types={types}
        availableTypes={availableTypes}
        defaultTypes={defaultTypes}
        from={from}
        to={to}
      />

      {truncated ? (
        <p className="text-sm text-muted-foreground">
          Es werden nur die neuesten Einträge angezeigt — bitte den Zeitraum
          weiter eingrenzen.
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function parseTypes(
  raw: string | undefined,
  available: ActivityEventType[],
  defaults: ActivityEventType[],
): ActivityEventType[] {
  if (!raw) {
    return defaults;
  }
  const requested = raw.split(",");
  const valid = available.filter((type) => requested.includes(type));
  return valid.length > 0 ? valid : defaults;
}

function startOfDay(dateOnly: string): Date {
  return parseDateOnly(dateOnly).startOf("day").toJSDate();
}

function endOfDay(dateOnly: string): Date {
  return parseDateOnly(dateOnly).endOf("day").toJSDate();
}
