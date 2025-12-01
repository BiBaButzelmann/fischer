import { TournamentSectionData } from "./types";

export function generateTournamentSection(
  tournamentSectionData: TournamentSectionData,
) {
  return `###\r
Name:\r
Ort:\r
FIDE-Land:\r
Datum(S):   ${formatDate(tournamentSectionData.startDate)}           Datum(E):   ${formatDate(tournamentSectionData.endDate)}\r
ZÅge(1):                         ZÅge(2):                         ZÅge(3):\r
Turnierorganisator:\r
Hauptschiedsrichter:\r
Weitere Schiedsrichter:\r
Anwender:        ${tournamentSectionData.user}\r`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("de-DE");
}
