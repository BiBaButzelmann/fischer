import { db } from "../client";
import { gamePostponement } from "../schema/gamePostponement";
import { GamePostponement } from "../types/game-postponement";

export async function createGamePostponement(
  gameId: number,
  postponingParticipantId: number,
  postponedByProfileId: number,
  fromDate: Date,
  toDate: Date,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<GamePostponement> {
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
}
