import { CalendarEvent } from "../types/calendar";
import {
  getGameTimeFromGame,
  getDateTimeFromDefaultTime,
  getSetupHelperTimeFromDefaultTime,
} from "@/lib/game-time";
import { getBerlinTime, toLocalDateTime } from "@/lib/date";
import { getMatchdaysByRefereeId } from "./referee";
import { getParticipantWithGroupByProfileIdAndTournamentId } from "./participant";
import { getRefereeByProfileIdAndTournamentId } from "./referee";
import {
  getMatchdaysBySetupHelperId,
  getSetupHelperByProfileIdAndTournamentId,
} from "./setup-helper";
import { getParticipantGames } from "./game";

export async function getCalendarEventsForParticipant(
  participantId: number,
): Promise<CalendarEvent[]> {
  const games = await getParticipantGames(participantId);

  const events: CalendarEvent[] = [];
  for (const game of games) {
    const gameDateTime = getGameTimeFromGame(game);

    const whitePlayerDisabled =
      game.whiteParticipant?.deletedAt != null &&
      toLocalDateTime(game.whiteParticipant.deletedAt) <= gameDateTime;
    const blackPlayerDisabled =
      game.blackParticipant?.deletedAt != null &&
      toLocalDateTime(game.blackParticipant.deletedAt) <= gameDateTime;

    if (whitePlayerDisabled || blackPlayerDisabled) {
      // Skip games where one of the players is disabled at the time of the game
      continue;
    }

    events.push({
      id: `game-${game.id}`,
      title: `Runde ${game.round}`,
      start: gameDateTime.toJSDate(),
      extendedProps: {
        eventType: "game" as const,
        gameId: game.id,
        participantId: participantId,
        round: game.round,
        tournamentId: game.tournamentId,
        groupId: game.groupId,
      },
    });
  }
  return events;
}

export async function getCalendarEventsForReferee(refereeId: number) {
  const refereeMatchdays = await getMatchdaysByRefereeId(refereeId);

  return refereeMatchdays.map((entry) => {
    return {
      id: `referee-${entry.matchday.id}`,
      title: `Schiedsrichter`,
      start: getDateTimeFromDefaultTime(entry.matchday.date).toJSDate(),
      extendedProps: {
        eventType: "referee" as const,
        refereeId: entry.referee.id,
        matchdayId: entry.matchday.id,
        tournamentId: entry.matchday.tournamentId,
      },
    };
  });
}

export async function getCalendarEventsForSetupHelper(setupHelperId: number) {
  const setupHelperMatchdays = await getMatchdaysBySetupHelperId(setupHelperId);

  return setupHelperMatchdays.map((entry) => {
    return {
      id: `setupHelper-${entry.matchday.id}`,
      title: `Aufbauhelfer`,
      start: getSetupHelperTimeFromDefaultTime(entry.matchday.date).toJSDate(),
      extendedProps: {
        eventType: "setupHelper" as const,
        setupHelperId: entry.setupHelper.id,
        matchdayId: entry.matchday.id,
        tournamentId: entry.matchday.tournamentId,
      },
    };
  });
}

export async function getUpcomingEventsByProfileAndTournament(
  profileId: number,
  tournamentId: number,
  limit: number = 3,
): Promise<CalendarEvent[]> {
  const [participant, referee, setupHelper] = await Promise.all([
    getParticipantWithGroupByProfileIdAndTournamentId(profileId, tournamentId),
    getRefereeByProfileIdAndTournamentId(profileId, tournamentId),
    getSetupHelperByProfileIdAndTournamentId(profileId, tournamentId),
  ]);

  const eventPromises: Promise<CalendarEvent[]>[] = [];
  if (participant) {
    eventPromises.push(getCalendarEventsForParticipant(participant.id));
  }
  if (referee) {
    eventPromises.push(getCalendarEventsForReferee(referee.id));
  }
  if (setupHelper) {
    eventPromises.push(getCalendarEventsForSetupHelper(setupHelper.id));
  }

  if (eventPromises.length === 0) {
    return [];
  }

  const allEvents = await Promise.all(eventPromises);

  const currentBerlinTime = getBerlinTime();

  return allEvents
    .flat()
    .filter((event) => event.start > currentBerlinTime)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, limit);
}
