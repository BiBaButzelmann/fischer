import { authWithRedirect } from "@/auth/utils";
import { RolesManager } from "@/components/klubturnier-anmeldung/roles-manager";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import { getOpenRegistrationTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";

export default async function RolesPage() {
  const session = await authWithRedirect();

  const [profile, tournament] = await Promise.all([
    getProfileByUserId(session.user.id),
    getOpenRegistrationTournament(),
  ]);
  if (!profile) {
    redirect("/willkommen");
  }

  if (!tournament) {
    return (
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Anmeldung zum Klubturnier
        </h1>
        <p className="text-muted-foreground">
          Aktuell ist keine Anmeldung möglich – es befindet sich kein Turnier in
          der Anmeldephase.
        </p>
      </div>
    );
  }

  const initialValues = await getRolesDataByProfileIdAndTournamentId(
    profile.id,
    tournament.id,
  );
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Anmeldung zum {tournament.name}
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
