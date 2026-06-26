import { authWithRedirect } from "@/auth/utils";
import { MatchEntryDashboard } from "@/components/partieneingabe/match-entry-dashboard";
import { AssignedGroups } from "@/components/partieneingabe/assigned-groups";
import { getGamesToEnterByUserId } from "@/db/repositories/game";
import { getRolesByUserId } from "@/db/repositories/role";
import { getMatchEnteringHelperIdByUserId } from "@/db/repositories/match-entering-helper";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { getUserGameRights } from "@/lib/game-auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { tournamentPath } from "@/lib/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await authWithRedirect();
  const { slug } = await params;

  const tournament = await getTournamentBySlug(slug);
  if (tournament?.stage === "done") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const userRoles = await getRolesByUserId(session.user.id);
  const canEnterAnyGame = userRoles.some((role) =>
    ["participant", "matchEnteringHelper", "admin", "referee"].includes(role),
  );

  if (!canEnterAnyGame) {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const [allGames, matchEnteringHelperId] = await Promise.all([
    getGamesToEnterByUserId(session.user.id),
    getMatchEnteringHelperIdByUserId(session.user.id),
  ]);

  const allRights = await Promise.all(
    allGames.map((game) => getUserGameRights(game.id, session.user.id)),
  );

  const gameRightsMap = new Map(
    allGames.map((game, index) => [game.id, allRights[index]]),
  );

  const editableGames = allGames.filter(
    (game) => gameRightsMap.get(game.id) === "edit",
  );

  const pendingGames = editableGames.filter((game) => game.pgn === null);
  const completedGames = editableGames.filter((game) => game.pgn !== null);

  const isParticipant = userRoles.includes("participant");

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900">
                  Meine Partieneingabe
                </h1>
                {matchEnteringHelperId && (
                  <AssignedGroups
                    matchEnteringHelperId={matchEnteringHelperId}
                  />
                )}
                {!matchEnteringHelperId && isParticipant && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-600">
                      Eigene Partien{" "}
                      <span className="text-slate-500">
                        (freiwillige Eingabe)
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-700">
                  {pendingGames.length}
                </div>
                <div className="text-sm text-slate-500">
                  Ausstehende Partien
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <MatchEntryDashboard
          pendingGames={pendingGames}
          completedGames={completedGames}
        />
      </div>
    </div>
  );
}
