import { GAME_START_TIME } from "@/constants/constants";

/**
 * Creates a Date object for a game with the specified matchday date and the standard game start time (7 PM German time)
 * @param matchdayDate - The date of the matchday (Date object or string)
 * @returns A Date object with the game date and time
 */
export function getGameDateTime(matchdayDate: Date): Date {
  const gameDateTime = new Date(matchdayDate);
  gameDateTime.setHours(
    GAME_START_TIME.hours,
    GAME_START_TIME.minutes,
    GAME_START_TIME.seconds,
  );
  return gameDateTime;
}

/**
 * Creates a Date object for a game from a complete game object
 * @param game - The game object with matchdayGame relation
 * @returns A Date object with the game date and time
 * @throws Error if the matchday relation is missing
 */
export function getGameTimeFromGame(game: {
  matchdayGame: {
    matchday: { date: Date } | null;
  } | null;
}): Date {
  if (!game.matchdayGame || !game.matchdayGame.matchday) {
    throw new Error(
      "Game has no matchday relation. Please check the game scheduling.",
    );
  }

  return getGameDateTime(game.matchdayGame.matchday.date);
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
