import { CalendarEvent } from "../types/calendar";
import {
  getGameTimeFromGame,
  getDateTimeFromTournamentTime,
  getSetupHelperTimeFromTournamentTime,
} from "@/lib/game-time";
import { getCurrentLocalDateTime, toLocalDateTime } from "@/lib/date";
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
    const gameDateTime = await getGameTimeFromGame(game);

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

  return await Promise.all(
    refereeMatchdays.map(async (entry) => {
      const startTime = await getDateTimeFromTournamentTime(
        entry.matchday.date,
        entry.matchday.tournamentId,
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
    }),
  );
}

export async function getCalendarEventsForSetupHelper(setupHelperId: number) {
  const setupHelperMatchdays = await getMatchdaysBySetupHelperId(setupHelperId);

  return await Promise.all(
    setupHelperMatchdays.map(async (entry) => {
      const startTime = await getSetupHelperTimeFromTournamentTime(
        entry.matchday.date,
        entry.matchday.tournamentId,
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
    }),
  );
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

  const currentTime = getCurrentLocalDateTime().toJSDate();

  return allEvents
    .flat()
    .filter((event) => event.start > currentTime)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, limit);
}
