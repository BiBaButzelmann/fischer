import { getActiveTournament } from "@/db/repositories/tournament";
import { auth } from "@/auth/utils";
import { AppSidebar } from "./app-sidebar";

export async function AppSidebarWrapper() {
  const session = await auth();
  const tournament = await getActiveTournament();

  return <AppSidebar session={session} tournament={tournament} />;
}
