import { getAllTournaments } from "@/db/repositories/tournament";
import { getRolesByUserId } from "@/db/repositories/role";
import { auth } from "@/auth/utils";
import { AppSidebar } from "./app-sidebar";
import { getTournamentDocumentAvailability } from "@/actions/document";

export async function AppSidebarWrapper() {
  const session = await auth();
  const [userRoles, tournaments] = await Promise.all([
    session ? getRolesByUserId(session.user.id) : Promise.resolve([]),
    getAllTournaments(),
  ]);

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
