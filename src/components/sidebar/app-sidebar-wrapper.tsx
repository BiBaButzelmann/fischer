import {
  getActiveTournament,
  getAllTournaments,
} from "@/db/repositories/tournament";
import { getRolesByUserId } from "@/db/repositories/role";
import { auth } from "@/auth/utils";
import { AppSidebar } from "./app-sidebar";

export async function AppSidebarWrapper() {
  const session = await auth();
  const [userRoles, tournaments, activeTournament] = await Promise.all([
    session ? getRolesByUserId(session.user.id) : Promise.resolve([]),
    getAllTournaments(),
    getActiveTournament(),
  ]);

  return (
    <AppSidebar
      session={session}
      tournaments={tournaments}
      defaultSlug={activeTournament?.slug}
      userRoles={userRoles}
    />
  );
}
