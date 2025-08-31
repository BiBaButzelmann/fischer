// TODO: update the time zone logic
// TODO: all dates / times should be in UTC in database
// TODO: when formatting the time to display -> convert to correct time zone

import { GAME_START_TIME } from "@/constants/constants";
import { GameWithMatchday } from "@/db/types/game";
import { toBerlinTime } from "./date";

/**
 * Creates a Date object for a game with the specified matchday date and the standard game start time (7 PM German time)
 * @param matchdayDate - The date of the matchday (Date object or string)
 * @returns A Date object with the game date and time
 */
export function getDateTimeFromDefaultTime(matchdayDate: Date): Date {
  const gameDateTime = new Date(matchdayDate);
  gameDateTime.setHours(
    GAME_START_TIME.hours,
    GAME_START_TIME.minutes,
    GAME_START_TIME.seconds,
  );
  return toBerlinTime(gameDateTime);
}

/**
 * Creates a Date object for setup helper with the specified matchday date and 30 minutes before game start time (6:30 PM German time)
 * @param matchdayDate - The date of the matchday (Date object or string)
 * @returns A Date object with the setup helper date and time
 */
export function getSetupHelperTimeFromDefaultTime(matchdayDate: Date): Date {
  const setupDateTime = new Date(matchdayDate);
  setupDateTime.setHours(
    GAME_START_TIME.hours,
    GAME_START_TIME.minutes - 30,
    GAME_START_TIME.seconds,
  );
  return toBerlinTime(setupDateTime);
}

/**
 * Creates a Date object for a game from a complete game object
 * @param game - The game object with matchdayGame relation
 * @returns A Date object with the game date and time
 */
export function getGameTimeFromGame(game: GameWithMatchday): Date {
  return getDateTimeFromDefaultTime(game.matchdayGame.matchday.date);
}

/**
 * Formats a game date for display in German locale (DD.MM.YYYY format)
 * @param gameDateTime - The game date/time to format
 * @returns A formatted date string in German format
 */
export function formatGameDate(gameDateTime: Date): string {
  return gameDateTime.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Formats the standard game start time for display (HH:MM Uhr format)
 * @returns A formatted time string in German format
 */
export function formatGameTime(): string {
  return `${GAME_START_TIME.hours.toString().padStart(2, "0")}:${GAME_START_TIME.minutes.toString().padStart(2, "0")} Uhr`;
}
