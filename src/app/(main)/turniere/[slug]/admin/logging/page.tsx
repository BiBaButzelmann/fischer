import { authWithRedirect } from "@/auth/utils";
import { redirect } from "next/navigation";
import { tournamentPath } from "@/lib/navigation";
import { getAllProfiles } from "@/db/repositories/admin";
import { getActivityTimelineForProfile } from "@/db/repositories/activity";
import {
  ACTIVITY_EVENT_TYPES,
  type ActivityEventType,
} from "@/lib/activity";
import { parseDateOnly } from "@/lib/date";
import { ActivityFilters } from "@/components/admin/activity-filters";
import { ActivityTable } from "@/components/admin/activity-table";

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

  const profiles = await getAllProfiles();

  const availableTypes: ActivityEventType[] = [...ACTIVITY_EVENT_TYPES];
  const types = parseTypes(query.types, availableTypes);
  const from = query.from;
  const to = query.to;

  const result =
    profileId != null
      ? await getActivityTimelineForProfile(profileId, {
          from: from ? startOfDay(from) : undefined,
          to: to ? endOfDay(to) : undefined,
          types,
        })
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Verlauf
        </h1>
        <p className="text-gray-600">
          Konto-, Login- und Anmeldungsaktivität einzelner Nutzer über alle
          Turniere einsehen.
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
        defaultTypes={availableTypes}
        from={from}
        to={to}
      />

      {result == null ? (
        <p className="text-sm text-muted-foreground">
          Bitte einen Nutzer auswählen, um dessen Aktivität zu sehen.
        </p>
      ) : (
        <>
          {result.truncated ? (
            <p className="text-sm text-muted-foreground">
              Es werden nur die neuesten Einträge angezeigt — bitte den
              Zeitraum weiter eingrenzen.
            </p>
          ) : null}
          <ActivityTable events={result.events} />
        </>
      )}
    </div>
  );
}

function parseTypes(
  raw: string | undefined,
  available: ActivityEventType[],
): ActivityEventType[] {
  if (!raw) {
    return available;
  }
  const requested = raw.split(",");
  const valid = available.filter((type) => requested.includes(type));
  return valid.length > 0 ? valid : available;
}

function startOfDay(dateOnly: string): Date {
  return parseDateOnly(dateOnly).startOf("day").toJSDate();
}

function endOfDay(dateOnly: string): Date {
  return parseDateOnly(dateOnly).endOf("day").toJSDate();
}
