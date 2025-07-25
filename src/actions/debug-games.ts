"use server";

import { db } from "@/db/client";

export async function debugGamesAction(groupId: number) {
  try {
    // First, check if the group exists
    const groupCheck = await db.query.group.findFirst({
      where: (group, { eq }) => eq(group.id, groupId),
    });

    if (!groupCheck) {
      return { success: false, error: `Group ${groupId} not found` };
    }

    // Check all games in the group (with and without results)
    const allGames = await db.query.game.findMany({
      where: (game, { eq }) => eq(game.groupId, groupId),
      columns: {
        id: true,
        result: true,
        round: true,
        boardNumber: true,
      },
    });

    // Check games with results
    const gamesWithResults = await db.query.game.findMany({
      where: (game, { eq, isNotNull, and }) =>
        and(eq(game.groupId, groupId), isNotNull(game.result)),
      columns: {
        id: true,
        result: true,
        round: true,
        boardNumber: true,
      },
    });

    return {
      success: true,
      groupExists: true,
      groupName: groupCheck.groupName,
      totalGames: allGames.length,
      gamesWithResults: gamesWithResults.length,
      allGames: allGames,
      gamesWithResultsData: gamesWithResults,
    };
  } catch (error) {
    console.error("Error in debugGamesAction:", error);
    return { success: false, error: "Failed to debug games" };
  }
}
