import type { HeaderSectionData } from "./types";

export function generatHeaderSection(
  headerSectionData: HeaderSectionData,
): string {
  return `${headerSectionData.tournamentName}\r
\r
ER  ${headerSectionData.numberOfPlayers}  ${headerSectionData.numberOfRounds}  ${headerSectionData.groupNumber} #910#\r`;
}
