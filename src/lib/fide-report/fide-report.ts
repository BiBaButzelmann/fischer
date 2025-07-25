import { TableGenerator } from "../table-generator";
import { TableEntry, TableEntryKeyValue } from "./types";
import {
  getStringRepresentationForScheduled,
  getStringRepresentationForValue,
  getStringRepresentationForResult,
} from "./utils";

function getGamesGroupedByScheduledDate(records: TableEntry[]) {
  const gamesByDate: Map<string, TableEntry[]> = new Map();

  records.forEach((record) => {
    record.results.forEach((result) => {
      const dateKey = getStringRepresentationForScheduled(result.scheduled);
      if (!gamesByDate.has(dateKey)) {
        gamesByDate.set(dateKey, []);
      }
      gamesByDate.get(dateKey)!.push(record);
    });
  });

  return gamesByDate;
}

function getGameColumnIdentifier(date: string): string {
  return `game${date}`;
}

export function generateFideReport(records: TableEntry[]): string {
  const tableGenerator = new TableGenerator();

  const games = getGamesGroupedByScheduledDate(records);

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

  for (const { results, ...record } of records) {
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
