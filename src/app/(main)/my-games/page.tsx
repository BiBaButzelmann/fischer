import { authWithRedirect } from "@/auth/utils";
import { MyGamesCalendar } from "@/components/my-games/my-games-calendar";
import { MyGamesList } from "@/components/my-games/my-games-list";
import { getGamesOfParticipant } from "@/db/repositories/game";
import { getParticipantByUserId } from "@/db/repositories/participant";

export default async function Page() {
  const session = await authWithRedirect();

  const currentParticipant = await getParticipantByUserId(session.user.id);
  if (currentParticipant == null) {
    return <div>Du bist nicht für ein Turnier angemeldet.</div>;
  }

  const games = await getGamesOfParticipant(currentParticipant.id);
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
