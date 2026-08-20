import { getAllTournaments } from "@/db/repositories/tournament";
import { getRolesByUserIdAndTournamentId } from "@/db/repositories/role";
import { auth } from "@/auth/utils";
import { AppSidebar } from "./app-sidebar";
import { getTournamentDocumentAvailability } from "@/actions/document";

export async function AppSidebarWrapper() {
  const session = await auth();
  const tournaments = await getAllTournaments();

  const runningTournament = tournaments.find((t) => t.stage === "running");
  const userRoles =
    session && runningTournament
      ? await getRolesByUserIdAndTournamentId(
          session.user.id,
          runningTournament.id,
        )
      : [];

  const activeTournament = tournaments.find(
    (t) => t.stage === "registration" || t.stage === "running",
  );
  const documentAvailability = activeTournament
    ? await getTournamentDocumentAvailability(activeTournament.slug)
    : { ausschreibung: false, turnierordnung: false };

  return (
    <AppSidebar
      session={session}
      tournaments={tournaments}
      userRoles={userRoles}
      documentAvailability={documentAvailability}
    />
  );
}
