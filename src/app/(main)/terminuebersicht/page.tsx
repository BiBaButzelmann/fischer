import { authWithRedirect } from "@/auth/utils";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getUpcomingAppointmentsByUserId } from "@/actions/appointment";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { redirect } from "next/navigation";
import { TerminuebersichtAppointmentsList } from "@/components/terminuebersicht/appointments-list";

export default async function Page() {
  const tournament = await getLatestTournament();
  const session = await authWithRedirect();

  const [referee, setupHelper] = await Promise.all([
    getRefereeByUserId(session.user.id),
    getSetupHelperByUserId(session.user.id),
  ]);

  if (!referee && !setupHelper) {
    redirect("/uebersicht");
  }

  const appointments = await getUpcomingAppointmentsByUserId(session.user.id);

  if (!tournament) {
    return (
      <div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Terminübersicht
            </h1>
            <p className="text-gray-600 mb-4">
              Hier findest du alle deine Termine als{" "}
              {referee && setupHelper
                ? "Schiedsrichter und Aufbauhelfer"
                : referee
                  ? "Schiedsrichter"
                  : "Aufbauhelfer"}
              . Falls du einen Termin absagen musst, suche bitte nach
              Möglichkeit einen Ersatz oder sprich dich mit den anderen Helfern
              ab.
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="pt-6 pb-6 px-6 text-center text-muted-foreground">
              <p className="text-lg">Aktuell ist kein Turnier verfügbar.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tournament.stage !== "running") {
    return (
      <div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Terminübersicht
            </h1>
            <p className="text-gray-600 mb-4">
              Hier findest du alle deine Termine als{" "}
              {referee && setupHelper
                ? "Schiedsrichter und Aufbauhelfer"
                : referee
                  ? "Schiedsrichter"
                  : "Aufbauhelfer"}
              . Falls du einen Termin absagen musst, suche bitte nach
              Möglichkeit einen Ersatz oder sprich dich mit den anderen Helfern
              ab.
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="pt-6 pb-6 px-6 text-center text-muted-foreground">
              <p className="text-lg">
                Termine sind nur während eines laufenden Turniers verfügbar.
              </p>
              <p className="mt-2">
                Das aktuelle Turnier befindet sich nicht in der Turnierphase.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Terminübersicht
          </h1>
          <p className="text-gray-600 mb-4">
            Hier findest du alle deine Termine als{" "}
            {referee && setupHelper
              ? "Schiedsrichter und Aufbauhelfer"
              : referee
                ? "Schiedsrichter"
                : "Aufbauhelfer"}
            . Falls du einen Termin absagen musst, suche bitte nach Möglichkeit
            einen Ersatz oder sprich dich mit den anderen Helfern ab.
          </p>
        </div>

        <TerminuebersichtAppointmentsList appointments={appointments} />
      </div>
    </div>
  );
}
