import { CalendarEvent } from "../types/calendar";
import { getGamesOfParticipant } from "./game";
import {
  getGameTimeFromGame,
  getDateTimeFromDefaultTime,
  getSetupHelperTimeFromDefaultTime,
} from "@/lib/game-time";
import { getMatchdaysByRefereeId } from "./referee";
import { getMatchdaysBySetupHelperId } from "./setup-helper";

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
      start: getDateTimeFromDefaultTime(entry.matchday.date),
      extendedProps: {
        eventType: "referee" as const,
        refereeId: entry.referee.id,
        matchdayId: entry.matchday.id,
        tournamentId: entry.matchday.tournamentId,
      },
    };
  });
}

export async function getCalendarEventsForSetupHelper(
  setupHelperId: number,
): Promise<CalendarEvent[]> {
  const setupHelperMatchdays = await getMatchdaysBySetupHelperId(setupHelperId);

  return setupHelperMatchdays.map((entry) => {
    return {
      id: `setupHelper-${entry.matchday.id}`,
      title: `Aufbauhelfer`,
      start: getSetupHelperTimeFromDefaultTime(entry.matchday.date),
      extendedProps: {
        eventType: "setupHelper" as const,
        setupHelperId: entry.setupHelper.id,
        matchdayId: entry.matchday.id,
        tournamentId: entry.matchday.tournamentId,
      },
    };
  });
}
