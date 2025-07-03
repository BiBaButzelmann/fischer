"use server";

import { authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { isUserParticipantInGame } from "@/db/repositories/game";
import { pgn } from "@/db/schema/pgn";

export const savePGN = async (newValue: string, gameId: number) => {
  const session = await authWithRedirect();

  // TODO: check for referee permissions
  if ((await isUserParticipantInGame(gameId, session.user.id)) === false) {
    throw new Error("You are not a participant in this game.");
  }

  await db
    .insert(pgn)
    .values({ gameId, value: newValue })
    .onConflictDoUpdate({
      target: pgn.gameId,
      set: { value: newValue },
    });
};
