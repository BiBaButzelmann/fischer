import { getGameStartTimeByTournamentId } from "@/db/repositories/tournament";
import { GameWithMatchday } from "@/db/types/game";
import { DateTime } from "luxon";
import invariant from "tiny-invariant";

/**
 * Creates a Date object for a game with the specified matchday date and tournament-specific game start time
 * @param matchdayDate - The date of the matchday (Date object or string)
 * @param tournamentId - The tournament ID to get the game start time from
 * @returns A Date object with the game date and time
 */
export async function getDateTimeFromTournamentTime(
  matchdayDate: Date,
  tournamentId: number,
) {
  const tournamentTime = await getGameStartTimeByTournamentId(tournamentId);

  invariant(tournamentTime, `Tournament with ID ${tournamentId} not found`);
  invariant(
    tournamentTime.gameStartTime,
    `Tournament with ID ${tournamentId} has no game start time`,
  );

  const [hours, minutes, seconds] = tournamentTime.gameStartTime
    .split(":")
    .map(Number);

  const gameDateTime = DateTime.fromJSDate(matchdayDate)
    .setZone("Europe/Berlin")
    .set({
      hour: hours,
      minute: minutes,
      second: seconds,
    });
  return gameDateTime;
}

/**
 * Creates a Date object for setup helper with the specified matchday date and 30 minutes before game start time
 * @param matchdayDate - The date of the matchday (Date object or string)
 * @param tournamentId - The tournament ID to get the game start time from
 * @returns A Date object with the setup helper date and time
 */
export async function getSetupHelperTimeFromTournamentTime(
  matchdayDate: Date,
  tournamentId: number,
): Promise<DateTime> {
  const tournamentTime = await getGameStartTimeByTournamentId(tournamentId);

  invariant(tournamentTime, `Tournament with ID ${tournamentId} not found`);
  invariant(
    tournamentTime.gameStartTime,
    `Tournament with ID ${tournamentId} has no game start time`,
  );

  const [hours, minutes, seconds] = tournamentTime.gameStartTime
    .split(":")
    .map(Number);

  const setupDateTime = DateTime.fromJSDate(matchdayDate)
    .setZone("Europe/Berlin")
    .set({
      hour: hours,
      minute: minutes - 30,
      second: seconds,
    });
  return setupDateTime;
}

/**
 * Creates a Date object for a game from a complete game object
 * @param game - The game object with matchdayGame relation and tournamentId
 * @returns A Date object with the game date and time
 */
export async function getGameTimeFromGame(game: GameWithMatchday) {
  return await getDateTimeFromTournamentTime(
    game.matchdayGame.matchday.date,
    game.tournamentId,
  );
}

/**
 * Formats the game start time for a specific tournament for display (HH:MM Uhr format)
 * @param tournamentId - The tournament ID to get the game start time from
 * @returns A formatted time string in German format
 */
export async function formatGameTimeByTournament(tournamentId: number) {
  const tournamentTime = await getGameStartTimeByTournamentId(tournamentId);

  invariant(tournamentTime, `Tournament with ID ${tournamentId} not found`);
  invariant(
    tournamentTime.gameStartTime,
    `Tournament with ID ${tournamentId} has no game start time`,
  );

  const [hours, minutes] = tournamentTime.gameStartTime.split(":").map(Number);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} Uhr`;
}
