import { getActiveTournament } from "@/db/repositories/tournament";
import { getRolesByUserId } from "@/db/repositories/role";
import { auth } from "@/auth/utils";
import { AppSidebar } from "./app-sidebar";

export async function AppSidebarWrapper() {
  const session = await auth();
  const userRoles = session ? await getRolesByUserId(session.user.id) : [];
  const tournament = await getActiveTournament();

  return (
    <AppSidebar
      session={session}
      tournament={tournament}
      userRoles={userRoles}
    />
  );
}
