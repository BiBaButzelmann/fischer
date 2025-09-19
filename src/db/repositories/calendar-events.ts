import { CalendarEvent } from "../types/calendar";
import {
  getGameTimeFromGame,
  getDateTimeFromTournamentTime,
  getSetupHelperTimeFromTournamentTime,
} from "@/lib/game-time";
import { getCurrentLocalDateTime, toLocalDateTime } from "@/lib/date";
import { getParticipantWithGroupByProfileIdAndTournamentId } from "./participant";
import {
  getMatchdaysByRefereeId,
  getRefereeByProfileIdAndTournamentId,
} from "./referee";
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
    const gameDateTime = getGameTimeFromGame(
      game,
      game.tournament.gameStartTime,
    );

    const whitePlayerDeleted =
      game.whiteParticipant?.deletedAt &&
      toLocalDateTime(game.whiteParticipant.deletedAt) <= gameDateTime;
    const blackPlayerDeleted =
      game.blackParticipant?.deletedAt &&
      toLocalDateTime(game.blackParticipant.deletedAt) <= gameDateTime;

    if (whitePlayerDeleted || blackPlayerDeleted) {
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
        participantId,
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
    const startTime = getDateTimeFromTournamentTime(
      entry.matchday.date,
      entry.tournament.gameStartTime,
    );

    return {
      id: `referee-${entry.matchday.id}`,
      title: `Schiedsrichter`,
      start: startTime.toJSDate(),
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
    const startTime = getSetupHelperTimeFromTournamentTime(
      entry.matchday.date,
      entry.tournament.gameStartTime,
    );

    return {
      id: `setupHelper-${entry.matchday.id}`,
      title: `Aufbauhelfer`,
      start: startTime.toJSDate(),
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
) {
  const [participant, referee, setupHelper] = await Promise.all([
    getParticipantWithGroupByProfileIdAndTournamentId(profileId, tournamentId),
    getRefereeByProfileIdAndTournamentId(profileId, tournamentId),
    getSetupHelperByProfileIdAndTournamentId(profileId, tournamentId),
  ]);

  const allEvents: CalendarEvent[] = [];

  if (participant) {
    const participantEvents = await getCalendarEventsForParticipant(
      participant.id,
    );
    allEvents.push(...participantEvents);
  }
  if (referee) {
    const refereeEvents = await getCalendarEventsForReferee(referee.id);
    allEvents.push(...refereeEvents);
  }
  if (setupHelper) {
    const setupHelperEvents = await getCalendarEventsForSetupHelper(
      setupHelper.id,
    );
    allEvents.push(...setupHelperEvents);
  }

  if (allEvents.length === 0) {
    return [];
  }

  const currentTime = getCurrentLocalDateTime().toJSDate();

  return allEvents
    .filter((event) => event.start > currentTime)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, limit);
}
