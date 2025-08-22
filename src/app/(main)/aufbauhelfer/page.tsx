import { authWithRedirect } from "@/auth/utils";
import { UpcomingEvent } from "@/components/uebersicht/running/upcoming-event";
import { SetupHelperEventIcon } from "@/components/uebersicht/running/upcoming-setup-helper-event";
import { getRolesByUserId } from "@/db/repositories/role";
import {
  getMatchdaysBySetupHelperId,
  getSetupHelperByUserId,
} from "@/db/repositories/setup-helper";
import { getLatestTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";
import invariant from "tiny-invariant";

export default async function Page() {
  const tournament = await getLatestTournament();
  const session = await authWithRedirect();

  if (tournament == null) {
    return (
      <p className="mt-2 text-lg text-muted-foreground">
        Aktuell ist kein Turnier verfügbar.
      </p>
    );
  }

  const rolesData = await getRolesByUserId(session.user.id);
  if (
    !rolesData.includes("matchEnteringHelper") &&
    !rolesData.includes("admin")
  ) {
    redirect("/uebersicht");
  }

  const setupHelper = await getSetupHelperByUserId(session.user.id);
  invariant(setupHelper != null, "Setup helper not found");

  const matchdays = await getMatchdaysBySetupHelperId(setupHelper.id);
  invariant(matchdays != null, "Matchdays not found");

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Spieltage</h1>
      <div className="space-y-4">
        {matchdays.map(({ matchday }) => (
          <UpcomingEvent
            key={matchday.id}
            title="Aufbauhelfer"
            start={matchday.date}
            url={`/spieler-karten?matchdayId=${matchday.id}&tournamentId=${tournament.id}`}
            icon={<SetupHelperEventIcon />}
          />
        ))}
      </div>
    </div>
  );
}
