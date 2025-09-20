"use server";

import { db } from "@/db/client";
import { pgn } from "@/db/schema/pgn";
import { getUserGameRights } from "@/lib/game-auth";
import { authWithRedirect } from "@/auth/utils";
import { action } from "@/lib/actions";
import invariant from "tiny-invariant";

export const savePGN = action(async (newValue: string, gameId: number) => {
  const session = await authWithRedirect();
  const userRights = await getUserGameRights(gameId, session.user.id);

  invariant(
    userRights === "edit",
    "Du bist nicht berechtigt, diese Partie zu bearbeiten.",
  );

  await db
    .insert(pgn)
    .values({ gameId, value: newValue })
    .onConflictDoUpdate({
      target: pgn.gameId,
      set: { value: newValue },
    });
});
