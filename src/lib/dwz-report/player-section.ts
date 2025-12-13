import { TableGenerator } from "../table-generator";
import type { PlayerSectionData, Result } from "./types";

export function generatePlayerSection(
  playerSectionData: PlayerSectionData,
): string {
  const tableGenerator = new TableGenerator();
  // Define columns based on the expected output - exact match
  tableGenerator.addColumn("endGroupPosition", "ttt.", 5, "right");
  tableGenerator.addColumn("startingGroupPosition", "rrr", 3, "right");
  tableGenerator.addColumn(
    "name",
    "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn",
    32,
    "left",
  );
  tableGenerator.addColumn(
    "club",
    "vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv",
    32,
    "left",
  );
  tableGenerator.addColumn("lll", "lll", 3, "left");
  tableGenerator.addColumn("fideId", "ffffffffff", 10, "right");
  tableGenerator.addColumn("pppppppppp", "pppppppppp", 10, "left");
  tableGenerator.addColumn("birthYear", "gggggggg", 8, "right");
  tableGenerator.addColumn("eeee", "eeee", 4, "left");
  tableGenerator.addColumn("dddd", "dddd", 4, "left");
  tableGenerator.addColumn("zpsClubId", " zzzzz", 6, "right");
  tableGenerator.addColumn("zpsPlayerId", "mmmm ", 5, "left");

  const maxResults = Math.max(
    ...playerSectionData.map((player) => player.results.length),
  );
  for (let i = 1; i <= maxResults; i++) {
    tableGenerator.addColumn(`game${i}`, "", 5, "right");
  }
  // // Add rows for each player
  for (const player of playerSectionData) {
    const rowValues = [
      { id: "endGroupPosition", data: `${player.endGroupPosition}.` },
      {
        id: "startingGroupPosition",
        data: player.startingGroupPosition.toString(),
      },
      { id: "name", data: player.name },
      { id: "birthYear", data: player.birthYear?.toString() ?? "" },
      { id: "club", data: player.club },
      { id: "fideId", data: player.fideId ?? "" },
      { id: "zpsClubId", data: player.zpsClubId ?? "" },
      { id: "zpsPlayerId", data: player.zpsPlayerId ?? "" },
      ...player.results.map((result) => ({
        id: `game${result.round}`,
        data: formatResult(result),
      })),
    ];

    tableGenerator.addRowValues(rowValues);
  }
  return tableGenerator.generateTable();
}

function formatResult(result: Result): string {
  if (result.result === "+:" || result.result === "-:") {
    return `${result.result} ${result.opponentEndGroupPosition.toString().padStart(2, " ")}`;
  }
  return `${result.result}${result.pieceColor} ${result.opponentEndGroupPosition.toString().padStart(2, " ")}`;
}
