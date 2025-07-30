import { db } from "../client";
import { gamePostponement } from "../schema/gamePostponement";
import { eq, and } from "drizzle-orm";
import { GamePostponement } from "../types/game-postponement";

export async function createGamePostponement(
  gameId: number,
  postponingParticipantId: number,
  postponedByProfileId: number,
  fromDate: Date,
  toDate: Date,
): Promise<GamePostponement> {
  const [result] = await db
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

export async function updateGamePostponement(
  gameId: number,
  postponingParticipantId: number,
  postponedByProfileId: number,
  fromDate: Date,
  toDate: Date,
): Promise<GamePostponement> {
  const existing = await db.query.gamePostponement.findFirst({
    where: and(
      eq(gamePostponement.gameId, gameId),
      eq(gamePostponement.postponingParticipantId, postponingParticipantId),
    ),
  });

  if (existing) {
    const [result] = await db
      .update(gamePostponement)
      .set({
        postponedByProfileId,
        from: fromDate,
        to: toDate,
        updatedAt: new Date(),
      })
      .where(eq(gamePostponement.id, existing.id))
      .returning();

    return result;
  } else {
    return await createGamePostponement(
      gameId,
      postponingParticipantId,
      postponedByProfileId,
      fromDate,
      toDate,
    );
  }
}
