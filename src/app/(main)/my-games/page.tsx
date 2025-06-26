import { auth } from "@/auth/utils";
import { MyGamesCalendar } from "@/components/my-games/my-games-calendar";
import { MyGamesList } from "@/components/my-games/my-games-list";
import { db } from "@/db/client";
import { participant } from "@/db/schema/participant";
import { profile } from "@/db/schema/profile";
import { eq } from "drizzle-orm";

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meine Spiele</h1>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <MyGamesCalendar games={games} />
        <MyGamesList games={games} />
      </div>
    </div>
  );
}
