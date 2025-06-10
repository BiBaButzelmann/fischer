"use server";

import { db } from "@/db/client";
import { game } from "@/db/schema/game";
import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function removeScheduledGames(tournamentId: number) {
  await db.delete(game).where(eq(game.tournamentId, tournamentId));
}

// TODO: find out how to do transactions with drizzle and neon
export async function scheduleGames(tournamentId: number) {
  const groups = await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournamentId),
    with: {
      participants: true,
    },
  });

  const scheduledGames: InferInsertModel<typeof game>[] = [];
  for (const group of groups) {
    // TODO: implement game scheduling logic
  }

  await db.insert(game).values(scheduledGames);
  revalidatePath("/admin/tournament");
}
