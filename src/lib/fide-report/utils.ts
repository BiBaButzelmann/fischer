import { match } from "ts-pattern";
import { Result, TableEntryKeyValue, PlayerSectionData } from "./types";
import { DateTime } from "luxon";

export function getStringRepresentationForValue(value: TableEntryKeyValue) {
  return match(value)
    .with({ id: "index" }, ({ data }) => {
      return data.toString().padStart(3, "0");
    })
    .with({ id: "startingGroupPosition" }, ({ data }) => {
      return data.toString();
    })
    .with({ id: "gender" }, ({ data }) => {
      return data;
    })
    .with({ id: "title" }, ({ data }) => {
      return data;
    })
    .with({ id: "name" }, ({ data }) => {
      return data;
    })
    .with({ id: "fideRating" }, ({ data }) => {
      return data.toString();
    })
    .with({ id: "fideNation" }, ({ data }) => {
      return data;
    })
    .with({ id: "fideId" }, ({ data }) => {
      return data;
    })
    .with({ id: "birthYear" }, ({ data }) => {
      return `${data.year}/00/00`;
    })
    .with({ id: "currentPoints" }, ({ data }) => {
      return data.toFixed(1);
    })
    .with({ id: "currentGroupPosition" }, ({ data }) => {
      return data.toString();
    })
    .with({ id: "results" }, () => {
      throw new Error("Results have their own mapping");
    })
    .exhaustive();
}

export function getStringRepresentationForResult(game: Result) {
  return `${game.opponentGroupPosition.toString().padStart(4, " ")} ${game.pieceColor} ${game.result}`;
}

export function getStringRepresentationForScheduled(scheduled: DateTime) {
  return scheduled.toFormat("yyyy-MM-dd");
}

export function getGamesGroupedByScheduledDate(
  playerSectionData: PlayerSectionData,
) {
  const gamesByDate: Map<string, PlayerSectionData> = new Map();

  playerSectionData.forEach((record) => {
    record.results.forEach((result) => {
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
