import { auth } from "@/auth/utils";
import { RolesManager } from "@/components/roles/roles-manager";
import { getJurorByProfileIdAndTournamentId } from "@/db/repositories/juror";
import { getMatchEnteringHelperByProfileIdAndTournamentId } from "@/db/repositories/match-entering-helper";
import { getParticipantByProfileIdAndTournamentId } from "@/db/repositories/participant";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRefereeByProfileIdAndTournamentId } from "@/db/repositories/referee";
import { getSetupHelperByProfileIdAndTournamentId } from "@/db/repositories/setup-helper";
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

  const [participant, referee, matchEnteringHelper, setupHelper, juror] =
    await Promise.all([
      getParticipantByProfileIdAndTournamentId(profile.id, tournament.id),
      getRefereeByProfileIdAndTournamentId(profile.id, tournament.id),
      getMatchEnteringHelperByProfileIdAndTournamentId(
        profile.id,
        tournament.id,
      ),
      getSetupHelperByProfileIdAndTournamentId(profile.id, tournament.id),
      getJurorByProfileIdAndTournamentId(profile.id, tournament.id),
    ]);

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
      <RolesManager
        tournamentId={tournament.id}
        initialValues={{
          participant,
          referee,
          matchEnteringHelper,
          setupHelper,
          juror,
        }}
      />
    </div>
  );
}
