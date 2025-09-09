import { authWithRedirect } from "@/auth/utils";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { getSetupHelperNamesByMatchdayId } from "@/db/repositories/setup-helper";
import { getRefereeByMatchdayId } from "@/db/repositories/referee";
import { getUpcomingSetupHelperAppointmentsBySetupHelperId } from "@/db/repositories/setup-helper-appointments";
import { redirect } from "next/navigation";
import { SetupHelperAppointmentsList } from "@/components/setup-helper-appointments/setup-helper-appointments-list";

export default async function TerminePage() {
  const tournament = await getLatestTournament();

  const session = await authWithRedirect();

  const setupHelper = await getSetupHelperByUserId(session.user.id);
  if (!setupHelper) {
    redirect("/uebersicht");
  }

  const appointments = await getUpcomingSetupHelperAppointmentsBySetupHelperId(
    setupHelper.id,
  );

  if (!tournament) {
    return (
      <div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Aufbauhelfer-Termine
            </h1>
            <p className="text-gray-600 mb-4">
              Falls du einen Termin absagen musst, suche bitte nach Möglichkeit
              einen Ersatz oder sprich dich zumindest mit den anderen
              Aufbauhelfern ab.
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
              Aufbauhelfer-Termine
            </h1>
            <p className="text-gray-600 mb-4">
              Falls du einen Termin absagen musst, suche bitte nach Möglichkeit
              einen Ersatz oder sprich dich zumindest mit den anderen
              Aufbauhelfern ab.
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="pt-6 pb-6 px-6 text-center text-muted-foreground">
              <p className="text-lg">
                Aufbauhelfer-Termine sind nur während eines laufenden Turniers
                verfügbar.
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

  const appointmentsWithDetails = await Promise.all(
    appointments.map(async (appointment) => {
      const [setupHelpers, referee] = await Promise.all([
        getSetupHelperNamesByMatchdayId(appointment.matchdayId),
        getRefereeByMatchdayId(appointment.matchdayId),
      ]);

      const otherSetupHelpers = setupHelpers.filter(
        (helper) => helper.profileId !== setupHelper.profileId,
      );

      return {
        ...appointment,
        contactDetails: {
          otherSetupHelpers,
          referee,
        },
      };
    }),
  );

  return (
    <div>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Aufbauhelfer-Termine
          </h1>
          <p className="text-gray-600 mb-4">
            Falls du einen Termin absagen musst, suche bitte nach Möglichkeit
            einen Ersatz oder sprich dich mit den anderen Aufbauhelfern ab.
          </p>
        </div>

        <SetupHelperAppointmentsList appointments={appointmentsWithDetails} />
      </div>
    </div>
  );
}
