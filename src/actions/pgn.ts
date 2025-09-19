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

export const downloadPGN = action(
  async (currentPGN: string, gameId: number) => {
    const session = await authWithRedirect();
    const userRights = await getUserGameRights(gameId, session.user.id);

    invariant(
      userRights,
      "Du bist nicht berechtigt, diese Partie herunterzuladen.",
    );

    return { pgn: currentPGN };
  },
);

export const uploadPGN = action(async (pgnContent: string, gameId: number) => {
  const session = await authWithRedirect();
  const userRights = await getUserGameRights(gameId, session.user.id);
  const pgn = pgnContent.trim();

  invariant(
    userRights === "edit",
    "Du bist nicht berechtigt, diese Partie hochzuladen.",
  );
  invariant(pgn, "PGN darf nicht leer sein.");

  return { pgn };
});
