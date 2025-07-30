import { db } from "../client";
import { gamePostponement } from "../schema/gamePostponement";
import { GamePostponement } from "../types/game-postponement";

export async function createGamePostponement(
  gameId: number,
  postponingParticipantId: number,
  postponedByProfileId: number,
  fromDate: Date,
  toDate: Date,
): Promise<GamePostponement> {
  return await db.transaction(async (tx) => {
    const [result] = await tx
      .insert(gamePostponement)
      .values({
        gameId,
        postponingParticipantId,
        postponedByProfileId,
        from: fromDate,
        to: toDate,
      })
      .returning();

    return result;
  });
}
