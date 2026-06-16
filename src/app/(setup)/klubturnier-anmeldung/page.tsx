import { authWithRedirect } from "@/auth/utils";
import { RolesManager } from "@/components/klubturnier-anmeldung/roles-manager";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import {
  getLatestTournament,
  getTournamentBySlug,
} from "@/db/repositories/tournament";
import { tournamentPath } from "@/lib/navigation";
import { redirect } from "next/navigation";

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{ turnier?: string }>;
}) {
  const session = await authWithRedirect();
  const { turnier } = await searchParams;

  const [profile, tournament] = await Promise.all([
    getProfileByUserId(session.user.id),
    turnier ? getTournamentBySlug(turnier) : getLatestTournament(),
  ]);
  if (!profile || !tournament) {
    redirect("/willkommen");
  }

  if (tournament.stage !== "registration") {
    redirect(tournamentPath(tournament.slug, "/uebersicht"));
  }

  const initialValues = await getRolesDataByProfileIdAndTournamentId(
    profile.id,
    tournament.id,
  );
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Anmeldung zum Klubturnier
        </h1>
        <p className="text-muted-foreground mt-2">
          Führe eine oder mehrere Anmeldungen durch und gib deine Informationen
          dazu an.
        </p>
      </header>
      <RolesManager
        key={JSON.stringify(initialValues)}
        userId={session.user.id}
        rolesData={initialValues}
        tournament={tournament}
        profile={profile}
      />
    </div>
  );
}
