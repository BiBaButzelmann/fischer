import { getHeaders } from "better-auth/react";

type TableEntry = {
  // ?
  index: number;
  startingGroupPosition: number;
  gender: "m" | "f";
  title: string;
  // firstName, lastName
  name: string;
  fideRating: number;
  fideNation: string;
  fideId: string;
  // yyyy/00/00
  birthYear: Date;
  // X.0
  currentPoints: number;
  currentGroupPosition: number;
  results: Result[];
};

type Result = {
  scheduled: Date;
  opponentGroupPosition: number;
  pieceColor: "w" | "b";
  result: "1" | "0" | "+" | "-";
};

function formatRecord(record: TableEntry): string {
  // Helper function to format the date as YYYY/00/00
  const formatDate = (date: Date): string => {
    const year = date.getUTCFullYear();
    // The original format uses "00" for month and day. We replicate that here.
    return `${year}/00/00`;
  };

  // Build each part of the string with appropriate padding
  const part1_id = record.index.toString().padStart(3, "0"); // DDD
  const part2_startingGroupPosition = record.startingGroupPosition
    .toString()
    .padStart(4, " "); // SSSS
  // TTT is a constant 'm' in the example, but we could make it dynamic
  const part3_gender = record.gender.padEnd(1, " ");
  const part4_title = record.title.padEnd(3, " "); // s
  const part5_name = record.name.padEnd(33, " "); // NNN...
  const part6_fideRating = record.fideRating.toString().padEnd(4, " "); // RRRR
  const part7_fideNation = record.fideNation.padEnd(3, " "); // FFF
  const part8_fideId = record.fideId.toString().padStart(11, " "); // IIII...
  const part9_regDate = formatDate(record.birthYear).padEnd(10, " "); // BBBB/BB/BB
  const part10_points = record.currentPoints.toFixed(1).padStart(4, " "); // PPPP
  const part11_groupPosition = record.currentGroupPosition
    .toString()
    .padStart(4, " "); // RRRR

  // Combine the main parts
  let line = `${part1_id} ${part2_startingGroupPosition} ${part3_gender}${part4_title} ${part5_name} ${part6_fideRating} ${part7_fideNation} ${part8_fideId} ${part9_regDate} ${part10_points} ${part11_groupPosition}`;

  // Format and append game results
  record.results.forEach((game) => {
    const gameString = `${game.opponentGroupPosition.toString().padStart(4, " ")} ${game.pieceColor} ${game.result}`;
    line += gameString.padStart(10, " ");
  });

  return line + " ";
}

function getGamesGroupedByScheduledDate(records: TableEntry[]) {
  const gamesByDate: Map<string, TableEntry[]> = new Map();

  records.forEach((record) => {
    record.results.forEach((result) => {
      const dateKey = result.scheduled.toISOString().split("T")[0]; // Use YYYY-MM-DD format
      if (!gamesByDate.has(dateKey)) {
        gamesByDate.set(dateKey, []);
      }
      gamesByDate.get(dateKey)!.push(record);
    });
  });

  return gamesByDate;
}

function getTableHeaders(records: TableEntry[]): string[] {
  let header1 =
    "         1         2         3         4         5         6         7         8         9";
  let header2 =
    "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
  let header3 =
    "DDD SSSS sTTT NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN RRRR FFF IIIIIIIIIII BBBB/BB/BB PPPP RRRR ";

  const games = getGamesGroupedByScheduledDate(records);
  const matchDaysCount = games.size;

  if (matchDaysCount > 0) {
    const header1Matches = Array.from(games.keys())
      .map((_, index) => `${10 + index}`.padStart(10, " "))
      .join("");
    header1 += header1Matches;

    const header2Matches = Array.from(games.keys())
      .map(() => `1234567890`)
      .join("");
    header2 += header2Matches;

    const header3Matches = Array.from(games.keys())
      .map(
        (_, index) =>
          ` ${index + 1}${index + 1}${index + 1}${index + 1} ${index + 1} ${index + 1} `,
      )
      .join("");
    header3 += header3Matches;
  }

  return [header1, header2, header3];
}

export function generateTable(records: TableEntry[]): string {
  const header = getTableHeaders(records).join("\n");
  const body = records.map(formatRecord).join("\n");

  return `${header}\n${body}`;
}
