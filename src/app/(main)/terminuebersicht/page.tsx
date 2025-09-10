import { authWithRedirect } from "@/auth/utils";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { redirect } from "next/navigation";
import { TerminuebersichtAppointmentsList } from "@/components/terminuebersicht/appointments-list";
import { getUpcomingAppointmentsByUserId } from "@/services/appointment";

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

  if (!tournament || tournament.stage !== "running") {
    redirect("/uebersicht");
  }

  const appointments = await getUpcomingAppointmentsByUserId(session.user.id);

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
