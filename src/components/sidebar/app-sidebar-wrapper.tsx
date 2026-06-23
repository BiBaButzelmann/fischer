import { getAllTournaments } from "@/db/repositories/tournament";
import { getRolesByUserId } from "@/db/repositories/role";
import { auth } from "@/auth/utils";
import { AppSidebar } from "./app-sidebar";

export async function AppSidebarWrapper() {
  const session = await auth();
  const [userRoles, tournaments] = await Promise.all([
    session ? getRolesByUserId(session.user.id) : Promise.resolve([]),
    getAllTournaments(),
  ]);

  return (
    <AppSidebar
      session={session}
      tournaments={tournaments}
      userRoles={userRoles}
    />
  );
}
