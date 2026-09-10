import { getAllTournaments } from "@/db/repositories/tournament";
import { getRolesByUserIdAndTournamentId } from "@/db/repositories/role";
import { auth } from "@/auth/utils";
import { AppSidebar } from "./app-sidebar";
import { getTournamentDocumentAvailability } from "@/actions/document";
import { Tournament } from "@/db/types/tournament";

export async function AppSidebarWrapper({
  tournament,
}: {
  tournament: Tournament;
}) {
  const session = await auth();
  const tournaments = await getAllTournaments();

  const userRoles =
    session && tournament.stage === "running"
      ? await getRolesByUserIdAndTournamentId(session.user.id, tournament.id)
      : [];

  const documentAvailability =
    tournament.stage !== "done"
      ? await getTournamentDocumentAvailability(tournament.slug)
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
