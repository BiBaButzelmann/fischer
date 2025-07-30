import { TableGenerator } from "../table-generator";
import type { PlayerSectionData, TableEntryKeyValue } from "./types";
import {
  getStringRepresentationForScheduled,
  getStringRepresentationForValue,
  getStringRepresentationForResult,
  getGamesGroupedByScheduledDate,
} from "./utils";

function getGameColumnIdentifier(date: string): string {
  return `game${date}`;
}

export function generatePlayerSection(
  playerSectionData: PlayerSectionData,
): string {
  const gamesTable = generateGamesTable(playerSectionData);
  const columnHeaders = generateColumnHeaders(playerSectionData);

  return `${columnHeaders}\n${gamesTable}`;
}

function generateGamesTable(playerSectionData: PlayerSectionData): string {
  const tableGenerator = new TableGenerator();

  const games = getGamesGroupedByScheduledDate(playerSectionData);

  // Define columns
  tableGenerator.addColumn("index", "DDD", 3, "left");
  tableGenerator.addColumn("startingGroupPosition", "SSSS", 4, "right");
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
  tableGenerator.addColumn("birthYear", "BBBB/BB/BB", 10, "left");
  tableGenerator.addColumn("currentPoints", "PPPP", 4, "right");
  tableGenerator.addColumn("currentGroupPosition", "RRRR", 4, "right");
  games.keys().forEach((date, index) => {
    tableGenerator.addColumn(
      getGameColumnIdentifier(date),
      `${index + 1}${index + 1}${index + 1}${index + 1} ${index + 1} ${index + 1}`,
      10,
      "center",
      true,
    );
  });

  for (const { results, ...record } of playerSectionData) {
    tableGenerator.addRowValues([
      ...Object.entries(record).map(([key, value]) => ({
        id: key,
        data: getStringRepresentationForValue({
          id: key,
          data: value,
        } as TableEntryKeyValue),
      })),
      ...results.map((result) => ({
        id: getGameColumnIdentifier(
          getStringRepresentationForScheduled(result.scheduled),
        ),
        data: getStringRepresentationForResult(result),
      })),
    ]);
  }

  return tableGenerator.generateTable();
}

function generateColumnHeaders(playerSectionData: PlayerSectionData): string {
  const tableGenerator = new TableGenerator();

  const games = getGamesGroupedByScheduledDate(playerSectionData);

  const columnsCount = 9 + games.size;
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
