import { DateTime } from "luxon";
import { PlayerSectionData, TournamentSectionData } from "./types";
import { getGamesGroupedByScheduledDate } from "./utils";

export function generateTournamentSection(
  tournamentSectionData: TournamentSectionData,
  playerSectionData: PlayerSectionData,
): string {
  const games = getGamesGroupedByScheduledDate(playerSectionData);
  const gameDates = Array.from(
    games.keys().map((dateString) => {
      const date = DateTime.fromISO(dateString);
      console.log(dateString);
      return ` ${date.toFormat("yy/MM/dd")} `;
    }),
  ).join("");

  return `012 ${tournamentSectionData.tournamentName}\r
022 ${tournamentSectionData.location}\r
032 ${tournamentSectionData.federation}\r
042 ${tournamentSectionData.startDate.toFormat("yyyy/MM/dd")}\r
052 ${tournamentSectionData.endDate.toFormat("yyyy/MM/dd")}\r
062 ${tournamentSectionData.numberOfPlayers}\r
072 ${tournamentSectionData.numberOfRatedPlayers}\r
092 ${tournamentSectionData.tournamentType}\r
102 ${tournamentSectionData.organizer}\r
122 ${tournamentSectionData.timeControl}\r
132                                                                                       ${gameDates}\r`;
}
