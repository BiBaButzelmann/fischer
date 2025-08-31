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

  const gamesWithRights = await Promise.all(
    allGames.map(async (game) => {
      const rights = await getUserGameRights(game.id, session.user.id);
      return {
        game,
        rights,
        hasPgn: game.pgn !== null,
      };
    }),
  );

  const editableGames = gamesWithRights.filter(
    ({ rights }) => rights === "edit",
  );

  const pendingGames = editableGames.filter(({ hasPgn }) => !hasPgn);
  const completedGames = editableGames.filter(({ hasPgn }) => hasPgn);

  return (
    <div>
      <MatchEntryDashboard
        pendingGames={pendingGames.map(({ game }) => game)}
        completedGames={completedGames.map(({ game }) => game)}
      />
    </div>
  );
}
