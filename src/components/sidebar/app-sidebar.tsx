import { Suspense } from "react";
import { TournamentStage } from "@/db/types/tournament";
import { getActiveTournament } from "@/db/repositories/tournament";
import AuthedSidebar from "./authed-sidebar";
import UnauthedSidebar from "./unauthed-sidebar";
import { auth } from "@/auth/utils";

export async function AppSidebar() {
  const session = await auth();
  const tournament = await getActiveTournament();
  const stage: TournamentStage | undefined = tournament?.stage;

  if (session) {
    return (
      <Suspense fallback={null}>
        <AuthedSidebar stage={stage} />
      </Suspense>
    );
  }

  return <UnauthedSidebar stage={stage} />;
}
