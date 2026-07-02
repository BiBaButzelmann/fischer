import { GameWithMatchday } from "@/db/types/game";
import { parseDateOnly } from "@/lib/date";
import { DateTime } from "luxon";
import invariant from "tiny-invariant";

/**
 * Creates a DateTime for a game with the specified matchday date and game start time
 * @param matchdayDate - The date of the matchday ('YYYY-MM-DD' string)
 * @param gameStartTime - The game start time in HH:MM:SS format
 * @returns A DateTime with the game date and time in Europe/Berlin
 */
export function getDateTimeFromTournamentTime(
  matchdayDate: string,
  gameStartTime: string,
) {
  invariant(gameStartTime, "Game start time is required");

  const [hours, minutes, seconds] = gameStartTime.split(":").map(Number);

  const gameDateTime = parseDateOnly(matchdayDate).set({
    hour: hours,
    minute: minutes,
    second: seconds,
  });
  return gameDateTime;
}

/**
 * Creates a DateTime for setup helper with the specified matchday date and 30 minutes before game start time
 * @param matchdayDate - The date of the matchday ('YYYY-MM-DD' string)
 * @param gameStartTime - The game start time in HH:MM:SS format
 * @returns A DateTime with the setup helper date and time in Europe/Berlin
 */
export function getSetupHelperTimeFromTournamentTime(
  matchdayDate: string,
  gameStartTime: string,
): DateTime {
  invariant(gameStartTime, "Game start time is required");

  const [hours, minutes, seconds] = gameStartTime.split(":").map(Number);

  const setupDateTime = parseDateOnly(matchdayDate).set({
    hour: hours,
    minute: minutes - 30,
    second: seconds,
  });
  return setupDateTime;
}

/**
 * Creates a Date object for a game from a complete game object
 * @param game - The game object with matchdayGame relation and gameStartTime
 * @param gameStartTime - The game start time in HH:MM:SS format
 * @returns A Date object with the game date and time
 */
export function getGameTimeFromGame(
  game: GameWithMatchday,
  gameStartTime: string,
) {
  return getDateTimeFromTournamentTime(
    game.matchdayGame.matchday.date,
    gameStartTime,
  );
}

/**
 * Formats the game start time for display (HH:MM Uhr format)
 * @param gameStartTime - The game start time in HH:MM:SS format
 * @returns A formatted time string in German format
 */
export function formatGameTimeByTournament(gameStartTime: string) {
  invariant(gameStartTime, "Game start time is required");

  const [hours, minutes] = gameStartTime.split(":").map(Number);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} Uhr`;
}
