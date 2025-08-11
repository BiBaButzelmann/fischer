"use server";

import { authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import {
  isUserParticipantInGame,
  isUserMatchEnteringHelperInGame,
} from "@/db/repositories/game";
import { pgn } from "@/db/schema/pgn";

export const savePGN = async (newValue: string, gameId: number) => {
  const session = await authWithRedirect();

  const [isParticipant, isMatchEnteringHelper] = await Promise.all([
    isUserParticipantInGame(gameId, session.user.id),
    isUserMatchEnteringHelperInGame(gameId, session.user.id),
  ]);

  if (
    !isParticipant &&
    !isMatchEnteringHelper &&
    session.user.role !== "admin"
  ) {
    throw new Error("You are not authorized to edit this game.");
  }

  await db
    .insert(pgn)
    .values({ gameId, value: newValue })
    .onConflictDoUpdate({
      target: pgn.gameId,
      set: { value: newValue },
    });
};
