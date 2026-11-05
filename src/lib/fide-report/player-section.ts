import { DateTime } from "luxon";
import { TableGenerator } from "../table-generator";
import type { PlayerEntry, PlayerSectionData, Result } from "./types";
import {
  getGameColumns,
  getStringRepresentationForResult,
  getStringRepresentationForScheduled,
} from "./utils";

function getGameColumnIdentifier(key: string): string {
  return `game${key}`;
}

export function generatePlayerSection(
  playerSectionData: PlayerSectionData,
  roundDates?: Array<DateTime | undefined>,
): string {
  const columns = getGameColumns(playerSectionData, roundDates);
  const columnHeaders = generateColumnHeaders(columns.length);
  const gamesTable = generateGamesTable(playerSectionData, columns, roundDates);

  return `${columnHeaders}\n${gamesTable}`;
}

function generateGamesTable(
  playerSectionData: PlayerSectionData,
  columns: ReturnType<typeof getGameColumns>,
  roundDates?: Array<DateTime | undefined>,
): string {
  const tableGenerator = new TableGenerator();

  tableGenerator.addColumn("dataId", "DDD", 3, "left");
  tableGenerator.addColumn("startingPosition", "SSSS", 4, "right");
  tableGenerator.addColumn("gender", "s", 1, "left", true);
  tableGenerator.addColumn("title", "TTT", 3, "right");
  tableGenerator.addColumn(
    "name",
    "NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
    33,
    "left",
  );
  tableGenerator.addColumn("fideRating", "RRRR", 4, "right");
  tableGenerator.addColumn("fideNation", "FFF", 3, "left");
  tableGenerator.addColumn("fideId", "IIIIIIIIIII", 11, "right");
  tableGenerator.addColumn("birthDate", "BBBB/BB/BB", 10, "left");
  tableGenerator.addColumn("points", "PPPP", 4, "right");
  tableGenerator.addColumn("rank", "RRRR", 4, "right");

  for (const column of columns) {
    tableGenerator.addColumn(
      getGameColumnIdentifier(column.key),
      column.title,
      10,
      "center",
      true,
    );
  }

  for (const player of playerSectionData) {
    tableGenerator.addRowValues([
      { id: "dataId", data: "001" },
      { id: "startingPosition", data: player.startingPosition.toString() },
      { id: "gender", data: getTrfGender(player) },
      { id: "title", data: player.title ?? "" },
      { id: "name", data: player.name },
      { id: "fideRating", data: formatFideRating(player) },
      { id: "fideNation", data: player.fideNation ?? "" },
      { id: "fideId", data: player.fideId ?? "" },
      { id: "birthDate", data: player.birthDate ?? "" },
      { id: "points", data: player.points.toFixed(1) },
      { id: "rank", data: player.rank.toString() },
      ...player.results.map((result) => ({
        id: getGameColumnIdentifier(
          getResultColumnKey(result, roundDates != null),
        ),
        data: getStringRepresentationForResult(result),
      })),
    ]);
  }

  return tableGenerator.generateTable();
}

function getTrfGender(player: PlayerEntry): string {
  if (player.gender === "f") {
    return "w";
  }
  if (player.gender === "m") {
    return "m";
  }
  return "";
}

function formatFideRating(player: PlayerEntry): string {
  if (player.fideRating == null || player.fideRating <= 0) {
    return "";
  }

  return player.fideRating.toString();
}

function getResultColumnKey(result: Result, useRounds: boolean): string {
  if (useRounds) {
    if (result.round == null) {
      throw new Error("Result is missing the round");
    }

    return `round${result.round}`;
  }

  if (result.scheduled == null) {
    throw new Error("Result is missing the scheduled date");
  }

  return getStringRepresentationForScheduled(result.scheduled);
}

function generateColumnHeaders(gameColumnCount: number): string {
  const tableGenerator = new TableGenerator();

  const columnsCount = 9 + gameColumnCount;
  Array.from({ length: columnsCount }, (_, i) => i + 1).forEach((i) => {
    tableGenerator.addColumn(i.toString(), i.toString(), 10, "right", true);
  });

  tableGenerator.addRowValues(
    Array.from({ length: columnsCount }, (_, i) => ({
      id: (i + 1).toString(),
      data: "1234567890",
    })),
  );

  return tableGenerator.generateTable();
}
