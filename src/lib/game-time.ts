// TODO: update the time zone logic
// TODO: all dates / times should be in UTC in database
// TODO: when formatting the time to display -> convert to correct time zone

import { GAME_START_TIME } from "@/constants/constants";
import { GameWithMatchday } from "@/db/types/game";
import { DateTime } from "luxon";

/**
 * Creates a Date object for a game with the specified matchday date and the standard game start time (7 PM German time)
 * @param matchdayDate - The date of the matchday (Date object or string)
 * @returns A Date object with the game date and time
 */
export function getDateTimeFromDefaultTime(matchdayDate: Date): DateTime {
  const gameDateTime = DateTime.fromJSDate(matchdayDate)
    .setZone("Europe/Berlin")
    .set({
      hour: GAME_START_TIME.hours,
      minute: GAME_START_TIME.minutes,
      second: GAME_START_TIME.seconds,
    });
  return gameDateTime;
}

/**
 * Creates a Date object for setup helper with the specified matchday date and 30 minutes before game start time (6:30 PM German time)
 * @param matchdayDate - The date of the matchday (Date object or string)
 * @returns A Date object with the setup helper date and time
 */
export function getSetupHelperTimeFromDefaultTime(
  matchdayDate: Date,
): DateTime {
  const setupDateTime = DateTime.fromJSDate(matchdayDate)
    .setZone("Europe/Berlin")
    .set({
      hour: GAME_START_TIME.hours,
      minute: GAME_START_TIME.minutes - 30,
      second: GAME_START_TIME.seconds,
    });
  return setupDateTime;
}

/**
 * Creates a Date object for a game from a complete game object
 * @param game - The game object with matchdayGame relation
 * @returns A Date object with the game date and time
 */
export function getGameTimeFromGame(game: GameWithMatchday): DateTime {
  return getDateTimeFromDefaultTime(game.matchdayGame.matchday.date);
}

/**
 * Formats the standard game start time for display (HH:MM Uhr format)
 * @returns A formatted time string in German format
 */
export function formatGameTime(): string {
  return `${GAME_START_TIME.hours.toString().padStart(2, "0")}:${GAME_START_TIME.minutes.toString().padStart(2, "0")} Uhr`;
}
