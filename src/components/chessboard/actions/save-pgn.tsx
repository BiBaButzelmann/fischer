"use server";

import { db } from "@/db/client";
import { pgn } from "@/db/schema/pgn";

export const savePGN = async (newValue: string, gameId: number) => {
  await db
    .insert(pgn)
    .values({ gameId, value: newValue })
    .onConflictDoUpdate({
      target: pgn.gameId,
      set: { value: newValue },
    });
};
