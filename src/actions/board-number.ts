"use server";

import { db } from "@/db/client";
import { game } from "@/db/schema/game";
import { matchdayGame } from "@/db/schema/matchday";
import { and, eq, desc, sql, gt, exists } from "drizzle-orm";

export async function getNextAvailableBoardNumber(
  matchdayId: number,
  groupId: number,
) {
  const gameWithHighestBoardNumber = await db
    .select({ boardNumber: game.boardNumber })
    .from(matchdayGame)
    .innerJoin(game, eq(matchdayGame.gameId, game.id))
    .where(
      and(eq(matchdayGame.matchdayId, matchdayId), eq(game.groupId, groupId)),
    )
    .orderBy(desc(game.boardNumber))
    .limit(1);

  const highestBoardNumber = gameWithHighestBoardNumber[0]?.boardNumber ?? 0;
  return highestBoardNumber + 1;
}

export async function closeGapInBoardNumbers(
  matchdayId: number,
  groupId: number,
  removedBoardNumber: number,
) {
  await db
    .update(game)
    .set({ boardNumber: sql`${game.boardNumber} - 1` })
    .where(
      and(
        eq(game.groupId, groupId),
        gt(game.boardNumber, removedBoardNumber),
        exists(
          db
            .select()
            .from(matchdayGame)
            .where(
              and(
                eq(matchdayGame.gameId, game.id),
                eq(matchdayGame.matchdayId, matchdayId),
              ),
            ),
        ),
      ),
    );
}

export async function updateBoardNumberTransaction(
  gameId: number,
  groupId: number,
  currentBoardNumber: number,
  currentMatchdayId: number,
  newMatchdayId: number,
) {
  await db.transaction(async (tx) => {
    const newBoardNumber = await getNextAvailableBoardNumber(
      newMatchdayId,
      groupId,
    );

    await tx
      .update(game)
      .set({ boardNumber: newBoardNumber })
      .where(eq(game.id, gameId));

    await closeGapInBoardNumbers(
      currentMatchdayId,
      groupId,
      currentBoardNumber,
    );
  });
}
