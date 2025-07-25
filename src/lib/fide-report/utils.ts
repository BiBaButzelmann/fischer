import { match } from "ts-pattern";
import { Result, TableEntryKeyValue } from "./types";

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
      const year = data.getUTCFullYear();
      return `${year}/00/00`;
    })
    .with({ id: "currentPoints" }, ({ data }) => {
      return data.toFixed(1);
    })
    .with({ id: "currentGroupPosition" }, ({ data }) => {
      return data.toString();
    })
    .with({ id: "results" }, () => {
      throw new Error("Results have there own mapping");
    })
    .exhaustive();
}

export function getStringRepresentationForResult(game: Result) {
  return `${game.opponentGroupPosition.toString().padStart(4, " ")} ${game.pieceColor} ${game.result}`;
}

export function getStringRepresentationForScheduled(scheduled: Date) {
  return scheduled.toISOString().split("T")[0];
}
