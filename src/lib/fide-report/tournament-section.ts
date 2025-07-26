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

  return `012 ${tournamentSectionData.tournamentName} 
022 ${tournamentSectionData.location}
032 ${tournamentSectionData.federation}
042 ${tournamentSectionData.dateOfStart.toFormat("yyyy/MM/dd")}
052 ${tournamentSectionData.dateOfEnd.toFormat("yyyy/MM/dd")}
062 ${tournamentSectionData.numberOfPlayers}
072 ${tournamentSectionData.numberOfRatedPlayers}
092 ${tournamentSectionData.typeOfTournament}
102 ${tournamentSectionData.organizer}
122 ${tournamentSectionData.timeControl}
132                                                                                       ${gameDates}`;
}
