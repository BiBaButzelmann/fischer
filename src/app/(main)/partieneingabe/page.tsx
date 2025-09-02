import { authWithRedirect } from "@/auth/utils";
import { MatchEntryDashboard } from "@/components/partieneingabe/match-entry-dashboard";
import {
  getAllGamesWithParticipantsAndPGN,
  getGamesAccessibleByUser,
} from "@/db/repositories/game";
import { getRolesByUserId } from "@/db/repositories/role";
import { getUserGameRights } from "@/lib/game-auth";
import { redirect } from "next/navigation";

async function getGamesForUser(userId: string, isAdmin: boolean) {
  if (isAdmin) {
    return getAllGamesWithParticipantsAndPGN();
  }

  return getGamesAccessibleByUser(userId);
}

export default async function Page() {
  const session = await authWithRedirect();

  const userRoles = await getRolesByUserId(session.user.id);
  const canEnterAnyGame = userRoles.some((role) =>
    ["participant", "matchEnteringHelper", "admin"].includes(role),
  );

  if (!canEnterAnyGame) {
    redirect("/uebersicht");
  }

  const isAdmin = session.user.role === "admin";
  const allGames = await getGamesForUser(session.user.id, isAdmin);

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

  return (
    <div>
      <MatchEntryDashboard
        pendingGames={pendingGames}
        completedGames={completedGames}
      />
    </div>
  );
}
