import { authWithRedirect } from "@/auth/utils";
import { MyGamesCalendar } from "@/components/calendar/my-games-calendar";
import {
  getCalendarEventsForParticipant,
  getCalendarEventsForReferee,
  getCalendarEventsForSetupHelper,
} from "@/db/repositories/calendar-events";
import { getParticipantByUserId } from "@/db/repositories/participant";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { getAllMatchdaysByTournamentId } from "@/db/repositories/match-day";
import { getActiveTournament } from "@/db/repositories/tournament";

export default async function Page() {
  const session = await authWithRedirect();

  const [
    currentParticipant,
    currentReferee,
    currentSetupHelper,
    activeTournament,
  ] = await Promise.all([
    getParticipantByUserId(session.user.id),
    getRefereeByUserId(session.user.id),
    getSetupHelperByUserId(session.user.id),
    getActiveTournament(),
  ]);

  if (!currentParticipant && !currentReferee && !currentSetupHelper) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kalender</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Du bist weder als Teilnehmer, Schiedsrichter noch als Aufbauhelfer
            für ein Turnier angemeldet.
          </p>
        </div>
      </div>
    );
  }

  const [participantEvents, refereeEvents, setupHelperEvents, matchdays] =
    await Promise.all([
      currentParticipant
        ? getCalendarEventsForParticipant(currentParticipant.id)
        : Promise.resolve([]),
      currentReferee
        ? getCalendarEventsForReferee(currentReferee.id)
        : Promise.resolve([]),
      currentSetupHelper
        ? getCalendarEventsForSetupHelper(currentSetupHelper.id)
        : Promise.resolve([]),
      activeTournament
        ? getAllMatchdaysByTournamentId(activeTournament.id)
        : Promise.resolve([]),
    ]);

  const calendarEvents = [
    ...participantEvents,
    ...refereeEvents,
    ...setupHelperEvents,
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kalender</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="space-y-2">
            {activeTournament?.stage === "running" ? (
              <>
                <p className="text-blue-800 text-sm">
                  Hier siehst du deine Termine.
                  {currentParticipant && (
                    <span>
                      {" "}
                      Du kannst deine Spiele per Drag & Drop verschieben.
                    </span>
                  )}
                </p>

                {(currentParticipant ||
                  currentReferee ||
                  currentSetupHelper) && (
                  <div className="flex flex-wrap gap-4 text-xs">
                    {currentParticipant && (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-blue-700">Deine Spiele</span>
                      </div>
                    )}
                    {currentReferee && (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-red-700">
                          Schiedsrichter-Termine
                        </span>
                      </div>
                    )}
                    {currentSetupHelper && (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-green-700">
                          Aufbauhelfer-Termine
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-blue-800 text-sm">
                Deine Termine werden hier ab dem <strong>02.09.2025</strong>{" "}
                angezeigt.
              </p>
            )}
          </div>
        </div>
      </div>
      <MyGamesCalendar events={calendarEvents} matchdays={matchdays} />
    </div>
  );
}
