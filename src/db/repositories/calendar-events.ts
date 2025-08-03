import { CalendarEvent } from "../types/calendar";
import { getGamesOfParticipant } from "./game";
import { getGameTimeFromGame } from "@/lib/game-time";
import { getMatchdaysByRefereeId } from "./referee";

export async function getCalendarEventsForParticipant(
  participantId: number,
): Promise<CalendarEvent[]> {
  const games = await getGamesOfParticipant(participantId);

  return games.map((game) => {
    const gameDateTime = getGameTimeFromGame(game);

    return {
      id: `game-${game.id}`,
      title: `Runde ${game.round}`,
      start: gameDateTime,
      extendedProps: {
        eventType: "game" as const,
        gameId: game.id,
        participantId: participantId,
        round: game.round,
        tournamentId: game.tournamentId,
        groupId: game.groupId,
      },
    };
  });
}

export async function getCalendarEventsForReferee(
  refereeId: number,
): Promise<CalendarEvent[]> {
  const refereeMatchdays = await getMatchdaysByRefereeId(refereeId);

  return refereeMatchdays.map((entry) => {
    return {
      id: `referee-${entry.matchday.id}`,
      title: `Schiedsrichter`,
      start: entry.matchday.date,
      extendedProps: {
        eventType: "referee" as const,
        refereeId: entry.referee.id,
        matchdayId: entry.matchday.id,
        tournamentId: entry.matchday.tournamentId,
      },
    };
  });
}
