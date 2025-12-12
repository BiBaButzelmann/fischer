import { db } from "@/db/client";
import { game } from "@/db/schema/game";
import { matchdayReferee, matchday, matchdayGame } from "@/db/schema/matchday";
import { profile } from "@/db/schema/profile";
import { referee } from "@/db/schema/referee";
import { sql, eq, and, desc, isNull } from "drizzle-orm";

export async function getRefereeOfGroup(groupId: number, month?: number) {
  const countExpr = sql<number>`COUNT(*)`;
  const [row] = await db
    .select({
      refereeId: referee.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      occurrences: countExpr,
    })
    .from(matchdayReferee)
    .innerJoin(matchday, eq(matchday.id, matchdayReferee.matchdayId))
    .innerJoin(matchdayGame, eq(matchdayGame.matchdayId, matchday.id))
    .innerJoin(game, eq(game.id, matchdayGame.gameId))
    .innerJoin(referee, eq(referee.id, matchdayReferee.refereeId))
    .innerJoin(profile, eq(profile.id, referee.profileId))
    .where(
      and(
        eq(game.groupId, groupId),
        isNull(matchdayReferee.canceledAt),
        month != null
          ? sql`EXTRACT(MONTH FROM ${matchday.date}) = ${month}`
          : undefined,
      ),
    )
    .groupBy(referee.id, profile.firstName, profile.lastName)
    .orderBy(desc(countExpr))
    .limit(1);

  return row ?? null;
}
