import { CalendarEvent } from "../types/calendar";
import { getGamesOfParticipant } from "./game";
import { getGameTimeFromGame } from "@/lib/game-time";

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
        gameId: game.id,
        participantId: participantId,
        round: game.round,
        tournamentId: game.tournamentId,
        groupId: game.groupId,
      },
    };
  });
}
