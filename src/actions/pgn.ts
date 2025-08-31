"use server";

import { db } from "@/db/client";
import { pgn } from "@/db/schema/pgn";
import { getUserGameRights } from "@/lib/game-auth";
import { authWithRedirect } from "@/auth/utils";

export const savePGN = async (newValue: string, gameId: number) => {
  const session = await authWithRedirect();
  const userRights = await getUserGameRights(gameId, session.user.id);

  if (userRights !== "edit") {
    return { error: "You are not authorized to edit this game." };
  }

  await db
    .insert(pgn)
    .values({ gameId, value: newValue })
    .onConflictDoUpdate({
      target: pgn.gameId,
      set: { value: newValue },
    });
};
