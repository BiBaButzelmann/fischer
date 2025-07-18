import { authWithRedirect } from "@/auth/utils";
import { MyGamesCalendar } from "@/components/calendar/my-games-calendar";
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
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kalender</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 text-sm">
            Deine persönlichen Termine werden in diesem Kalender am{" "}
            <strong>02.09.2025</strong> angezeigt werden
          </p>
        </div>
      </div>
      <MyGamesCalendar games={games} />
    </div>
  );
}
