import { authWithRedirect } from "@/auth/utils";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { redirect } from "next/navigation";
import { AppointmentsList } from "@/components/terminuebersicht/appointments-list";
import { getMatchdayAppointmentsByUserId } from "@/services/appointment";
import { tournamentPath } from "@/lib/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  const session = await authWithRedirect();

  const [referee, setupHelper] = await Promise.all([
    getRefereeByUserId(session.user.id),
    getSetupHelperByUserId(session.user.id),
  ]);

  if (!referee && !setupHelper) {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  if (tournament?.stage !== "running") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const appointments = await getMatchdayAppointmentsByUserId(session.user.id);

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

        <AppointmentsList appointments={appointments} />
      </div>
    </div>
  );
}
