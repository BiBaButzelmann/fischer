import { TournamentSectionData } from "./types";

export function generateTournamentSection(
  tournamentSectionData: TournamentSectionData,
) {
  return `###\r
Name: ${tournamentSectionData.tournamentName}\r
Ort: ${tournamentSectionData.location}\r
Datum(S):   ${formatDate(tournamentSectionData.startDate)}           Datum(E):   ${formatDate(tournamentSectionData.endDate)}\r
Z¸ge: ${tournamentSectionData.timeLimit}
Turnierorganisator: ${tournamentSectionData.tournamentOrganizer}\r
Hauptschiedsrichter: ${tournamentSectionData.mainReferee}\r`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("de-DE");
}
