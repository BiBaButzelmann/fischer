import { authWithRedirect } from "@/auth/utils";
import { MatchEntryDashboard } from "@/components/partieneingabe/match-entry-dashboard";
import { AssignedGroups } from "@/components/partieneingabe/assigned-groups";
import { getGamesToEnterByUserIdAndTournamentId } from "@/db/repositories/game";
import { getRolesByUserIdAndTournamentId } from "@/db/repositories/role";
import {
  getAssignedGroupsByMatchEnteringHelperId,
  getMatchEnteringHelperIdByUserIdAndTournamentId,
} from "@/db/repositories/match-entering-helper";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { notFound, redirect } from "next/navigation";
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
  if (!tournament) {
    notFound();
  }
  if (tournament.stage === "done") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const userRoles = await getRolesByUserIdAndTournamentId(
    session.user.id,
    tournament.id,
  );
  const canEnterAnyGame = userRoles.some((role) =>
    ["participant", "matchEnteringHelper", "admin", "referee"].includes(role),
  );

  if (!canEnterAnyGame) {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const [allGames, matchEnteringHelperId] = await Promise.all([
    getGamesToEnterByUserIdAndTournamentId(session.user.id, tournament.id),
    getMatchEnteringHelperIdByUserIdAndTournamentId(
      session.user.id,
      tournament.id,
    ),
  ]);

  const assignedGroupsData = matchEnteringHelperId
    ? await getAssignedGroupsByMatchEnteringHelperId(matchEnteringHelperId)
    : [];
  const assignedGroups = assignedGroupsData.map((item) => ({
    id: item.group.id,
    groupName: item.group.groupName,
  }));
  const assignedGroupIds = new Set(assignedGroups.map((group) => group.id));

  const isAdmin = userRoles.includes("admin");
  const isReferee = userRoles.includes("referee");

  // Compute rights in memory. Calling getUserGameRights per game issued
  // several queries for every played game (up to 85 for a helper).
  const editableGames = allGames.filter((game) => {
    const isGameParticipant =
      game.whiteParticipant?.profile.userId === session.user.id ||
      game.blackParticipant?.profile.userId === session.user.id;

    return (
      isGameParticipant ||
      assignedGroupIds.has(game.groupId) ||
      isAdmin ||
      isReferee
    );
  });

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
                  <AssignedGroups groups={assignedGroups} />
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
