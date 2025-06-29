import { auth } from "@/auth/utils";
import { RolesManager } from "@/components/roles/roles-manager";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRolesByProfileId } from "@/db/repositories/role";
import { getLatestTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";

export default async function RolesPage() {
  const session = await auth();

  const [profile, tournament] = await Promise.all([
    getProfileByUserId(session.user.id),
    getLatestTournament(),
  ]);
  if (!profile || !tournament) {
    redirect("/willkommen");
  }

  const roles = await getRolesByProfileId(profile.id);
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Rollen-Auswahl
        </h1>
        <p className="text-muted-foreground mt-2">
          Wähle eine oder mehrere Rollen aus und gib deine Informationen dazu
          an.
        </p>
      </header>
      <RolesManager tournamentId={tournament.id} roles={roles} />
    </div>
  );
}
