import type { PlayerSectionData, TournamentSectionData } from "./types";
import { getGameColumns } from "./utils";

export function generateTournamentSection(
  tournamentSectionData: TournamentSectionData,
  playerSectionData: PlayerSectionData,
): string {
  const gameDates = getGameColumns(
    playerSectionData,
    tournamentSectionData.roundDates,
  )
    .map((column) => ` ${column.date?.toFormat("yy/MM/dd") ?? "        "} `)
    .join("");

  return `012 ${tournamentSectionData.tournamentName}\r
022 ${tournamentSectionData.location}\r
032 ${tournamentSectionData.federation}\r
042 ${tournamentSectionData.startDate.toFormat("yyyy/MM/dd")}\r
052 ${tournamentSectionData.endDate.toFormat("yyyy/MM/dd")}\r
062 ${tournamentSectionData.numberOfPlayers}\r
072 ${tournamentSectionData.numberOfRatedPlayers}\r
092 ${tournamentSectionData.tournamentType}\r
102 ${tournamentSectionData.referee}\r
122 ${tournamentSectionData.timeLimit}\r
132${" ".repeat(87)}${gameDates}\r`;
}
