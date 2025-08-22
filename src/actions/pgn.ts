"use server";

import { db } from "@/db/client";
import { pgn } from "@/db/schema/pgn";
import { canUserEditGame } from "@/lib/game-auth";
import { authWithRedirect } from "@/auth/utils";

export const savePGN = async (newValue: string, gameId: number) => {
  const session = await authWithRedirect();
  const canEdit = await canUserEditGame(
    gameId,
    session.user.id,
    session.user.role === "admin",
  );

  if (!canEdit) {
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
