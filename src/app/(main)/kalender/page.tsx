import { authWithRedirect } from "@/auth/utils";
import { MyGamesCalendar } from "@/components/calendar/my-games-calendar";
import {
  getCalendarEventsForParticipant,
  getCalendarEventsForReferee,
} from "@/db/repositories/calendar-events";
import { getParticipantByUserId } from "@/db/repositories/participant";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getAllMatchdaysByTournamentId } from "@/db/repositories/match-day";
import { getActiveTournament } from "@/db/repositories/tournament";

export default async function Page() {
  const session = await authWithRedirect();

  const currentParticipant = await getParticipantByUserId(session.user.id);
  const currentReferee = await getRefereeByUserId(session.user.id);

  if (!currentParticipant && !currentReferee) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kalender</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Du bist weder als Teilnehmer noch als Schiedsrichter für ein Turnier
            angemeldet.
          </p>
        </div>
      </div>
    );
  }

  const participantEvents = currentParticipant
    ? await getCalendarEventsForParticipant(currentParticipant.id)
    : [];

  const refereeEvents = currentReferee
    ? await getCalendarEventsForReferee(currentReferee.id)
    : [];

  const calendarEvents = [...participantEvents, ...refereeEvents];

  const activeTournament = await getActiveTournament();
  const matchdays = activeTournament
    ? await getAllMatchdaysByTournamentId(activeTournament.id)
    : [];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kalender</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 text-sm">
            {currentParticipant && currentReferee
              ? "Hier siehst du deine Spiele als Teilnehmer (blau) und deine Termine als Schiedsrichter (rot)."
              : currentParticipant
                ? "Hier siehst du deine Spiele als Teilnehmer. Du kannst Spiele per Drag & Drop verschieben."
                : "Hier siehst du deine Termine als Schiedsrichter."}
          </p>
        </div>
      </div>
      <MyGamesCalendar events={calendarEvents} matchdays={matchdays} />
    </div>
  );
}
