import { authWithRedirect } from "@/auth/utils";
import { MatchEntryDashboard } from "@/components/partieneingabe/match-entry-dashboard";
import { getGamesAssignedToEnter } from "@/db/repositories/game";
import { getRolesByUserId } from "@/db/repositories/role";
import {
  getMatchEnteringHelperIdByUserId,
  getAssignedGroupsByMatchEnteringHelperId,
} from "@/db/repositories/match-entering-helper";
import { getUserGameRights } from "@/lib/game-auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { GroupBadge } from "@/components/ui/group-badge";

export default async function Page() {
  const session = await authWithRedirect();

  const userRoles = await getRolesByUserId(session.user.id);
  const canEnterAnyGame = userRoles.some((role) =>
    ["participant", "matchEnteringHelper", "admin", "referee"].includes(role),
  );

  if (!canEnterAnyGame) {
    redirect("/uebersicht");
  }

  const matchEnteringHelperId = await getMatchEnteringHelperIdByUserId(
    session.user.id,
  );

  const [allGames, assignedGroupsData] = await Promise.all([
    getGamesAssignedToEnter(session.user.id),
    matchEnteringHelperId
      ? getAssignedGroupsByMatchEnteringHelperId(matchEnteringHelperId)
      : Promise.resolve([]),
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

  const assignedGroups = assignedGroupsData.map((item) => ({
    id: item.group.id,
    groupName: item.group.groupName,
  }));

  const isMatchEnteringHelper = userRoles.includes("matchEnteringHelper");
  const isParticipant = userRoles.includes("participant");

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Meine Partieneingabe
                </h1>
                {isMatchEnteringHelper && assignedGroups.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-600 mb-3">
                      Zugewiesene Gruppen{" "}
                      <span className="text-slate-500">(+ eigene Partien)</span>
                      :
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {assignedGroups.map((group) => (
                        <GroupBadge
                          key={group.id}
                          groupName={group.groupName}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {!isMatchEnteringHelper && isParticipant && (
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
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-700">
                    {pendingGames.length}
                  </div>
                  <div className="text-sm text-slate-500">
                    Ausstehende Partien
                  </div>
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
