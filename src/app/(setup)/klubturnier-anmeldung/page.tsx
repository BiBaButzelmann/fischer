import { authWithRedirect } from "@/auth/utils";
import { RolesManager } from "@/components/klubturnier-anmeldung/roles-manager";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import { getLatestTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookTextIcon, ExternalLinkIcon } from "lucide-react";

export default async function RolesPage() {
  const session = await authWithRedirect();

  const [profile, tournament] = await Promise.all([
    getProfileByUserId(session.user.id),
    getLatestTournament(),
  ]);
  if (!profile || !tournament) {
    redirect("/willkommen");
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

      {/* Document Links */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/ausschreibung"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-4 py-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200"
        >
          <BookTextIcon className="h-5 w-5" />
          <span className="font-medium">Ausschreibung</span>
          <ExternalLinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link
          href="/turnierordnung"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-4 py-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200"
        >
          <BookTextIcon className="h-5 w-5" />
          <span className="font-medium">Turnierordnung</span>
          <ExternalLinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>

      <RolesManager
        key={JSON.stringify(initialValues)}
        tournamentId={tournament.id}
        userId={session.user.id}
        rolesData={initialValues}
      />
    </div>
  );
}
