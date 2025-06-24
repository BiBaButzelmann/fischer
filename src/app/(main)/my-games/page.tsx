import { auth } from "@/auth/utils";
import { MyGamesCalendar } from "@/components/my-games/my-games-calendar";
import { db } from "@/db/client";
import { game } from "@/db/schema/game";
import { participant } from "@/db/schema/participant";
import { profile } from "@/db/schema/profile";
import { eq, or } from "drizzle-orm";

export default async function Page() {
  const session = await auth();

  const currentParticipant = await db
    .select()
    .from(participant)
    .leftJoin(profile, eq(participant.profileId, profile.id))
    .where(eq(profile.userId, session.user.id));

  if (currentParticipant.length === 0) {
    return <div>Du bist nicht für ein Turnier angemeldet.</div>;
  }

  const games = await db.query.game.findMany({
    where: (game, { or, eq }) =>
      or(
        eq(game.whiteParticipantId, currentParticipant[0].participant.id),
        eq(game.blackParticipantId, currentParticipant[0].participant.id),
      ),
    with: {
      whiteParticipant: {
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      blackParticipant: {
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return (
    <div>
      <span className="text-xl font-bold">Turnierplan</span>
      <MyGamesCalendar games={games} />
    </div>
  );
}
