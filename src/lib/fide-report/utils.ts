import type { GameResult } from "@/db/types/game";
import { DateTime } from "luxon";
import { match } from "ts-pattern";
import type { PlayerSectionData, Result } from "./types";

export type GameColumn = {
  key: string;
  title: string;
  date?: DateTime;
};

export function getStringRepresentationForResult(result: Result) {
  if (result.opponentStartingPosition == null) {
    return `0000 - ${result.result}`;
  }

  const opponent = result.opponentStartingPosition
    .toString()
    .padStart(4, " ");
  const playerResult = getPlayerResult(result.result, result.pieceColor);

  return `${opponent} ${result.pieceColor} ${playerResult}`;
}

function getPlayerResult(
  result: GameResult,
  pieceColor: "w" | "b",
): "1" | "0" | "=" | "+" | "-" {
  return match<GameResult, "1" | "0" | "=" | "+" | "-">(result)
    .with("+:-", () => (pieceColor === "w" ? "+" : "-"))
    .with("-:-", () => "-")
    .with("-:+", () => (pieceColor === "w" ? "-" : "+"))
    .with("0-½", () => (pieceColor === "w" ? "0" : "="))
    .with("0:1", () => (pieceColor === "w" ? "0" : "1"))
    .with("1:0", () => (pieceColor === "w" ? "1" : "0"))
    .with("½-0", () => (pieceColor === "w" ? "=" : "0"))
    .with("½-½", () => "=")
    .exhaustive();
}

export function getStringRepresentationForScheduled(scheduled: DateTime) {
  return scheduled.toFormat("yyyy-MM-dd");
}

export function getGameColumns(
  playerSectionData: PlayerSectionData,
  roundDates?: Array<DateTime | undefined>,
): GameColumn[] {
  if (roundDates != null) {
    const numberOfRounds = Math.max(
      roundDates.length,
      ...playerSectionData.flatMap((player) =>
        player.results.map((result) => result.round ?? 0),
      ),
      0,
    );

    return Array.from({ length: numberOfRounds }, (_, index) => {
      const round = index + 1;
      const digit = round % 10;
      return {
        key: `round${round}`,
        title: `${digit}${digit}${digit}${digit} ${digit} ${digit}`,
        date: roundDates[index],
      };
    });
  }

  return getGamesGroupedByScheduledDate(playerSectionData).map(
    ([dateString], index) => {
      const digit = (index + 1) % 10;
      return {
        key: dateString,
        title: `${digit}${digit}${digit}${digit} ${digit} ${digit}`,
        date: DateTime.fromISO(dateString),
      };
    },
  );
}

export function getGamesGroupedByScheduledDate(
  playerSectionData: PlayerSectionData,
) {
  const gamesByDate: Map<string, PlayerSectionData> = new Map();

  playerSectionData.forEach((record) => {
    record.results.forEach((result) => {
      if (result.scheduled == null) {
        return;
      }

      const dateKey = getStringRepresentationForScheduled(result.scheduled);
      if (!gamesByDate.has(dateKey)) {
        gamesByDate.set(dateKey, []);
      }
      gamesByDate.get(dateKey)!.push(record);
    });
  });

  return Array.from(gamesByDate.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
}
