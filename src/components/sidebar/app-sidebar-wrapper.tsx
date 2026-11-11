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
  const [session, tournaments, documentAvailability] = await Promise.all([
    auth(),
    getAllTournaments(),
    tournament.stage !== "done"
      ? getTournamentDocumentAvailability(tournament.slug)
      : Promise.resolve({ ausschreibung: false, turnierordnung: false }),
  ]);

  const userRoles =
    session && tournament.stage === "running"
      ? await getRolesByUserIdAndTournamentId(session.user.id, tournament.id)
      : [];

  return (
    <AppSidebar
      session={session}
      tournaments={tournaments}
      userRoles={userRoles}
      documentAvailability={documentAvailability}
    />
  );
}
