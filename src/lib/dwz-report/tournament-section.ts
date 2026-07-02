import { parseDateOnly } from "@/lib/date";
import { TournamentSectionData } from "./types";

export function generateTournamentSection(
  tournamentSectionData: TournamentSectionData,
) {
  return `###\r
Name: ${tournamentSectionData.tournamentName}\r
Ort: ${tournamentSectionData.location}\r
Datum(S):   ${formatDate(tournamentSectionData.startDate)}           Datum(E):   ${formatDate(tournamentSectionData.endDate)}\r
Z¸ge: ${tournamentSectionData.timeLimit}\r
Turnierorganisator: ${tournamentSectionData.tournamentOrganizer}\r
Hauptschiedsrichter: ${tournamentSectionData.mainReferee}\r`;
}

function formatDate(date: string) {
  return parseDateOnly(date).toFormat("d.M.yyyy");
}
