import { authWithRedirect } from "@/auth/utils";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { getRefereeByUserIdAndTournamentId } from "@/db/repositories/referee";
import { getSetupHelperByUserIdAndTournamentId } from "@/db/repositories/setup-helper";
import { notFound, redirect } from "next/navigation";
import { AppointmentsList } from "@/components/terminuebersicht/appointments-list";
import { getMatchdayAppointmentsByUserIdAndTournamentId } from "@/services/appointment";
import { tournamentPath } from "@/lib/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  const session = await authWithRedirect();
  if (!tournament) {
    notFound();
  }

  const [referee, setupHelper] = await Promise.all([
    getRefereeByUserIdAndTournamentId(session.user.id, tournament.id),
    getSetupHelperByUserIdAndTournamentId(session.user.id, tournament.id),
  ]);

  if (!referee && !setupHelper) {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  if (tournament?.stage !== "running") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const appointments = await getMatchdayAppointmentsByUserIdAndTournamentId(
    session.user.id,
    tournament.id,
  );

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
