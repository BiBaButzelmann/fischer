import { getActiveTournament } from "@/db/repositories/tournament";
import AuthedSidebar from "./authed-sidebar";
import UnauthedSidebar from "./unauthed-sidebar";
import { auth } from "@/auth/utils";

export async function AppSidebar() {
  const session = await auth();
  const tournament = await getActiveTournament();
  const stage = tournament?.stage;

  if (session) {
    return <AuthedSidebar session={session} stage={stage} />;
  }

  return <UnauthedSidebar stage={stage} />;
}
