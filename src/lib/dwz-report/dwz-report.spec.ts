import { describe, expect, it } from "vitest";
import { generatePlayerSection } from "./player-section";
import type {
  HeaderSectionData,
  PlayerSectionData,
  Result,
  TournamentSectionData,
} from "./types";
import { generatHeaderSection } from "./header-section";
import { generateTournamentSection } from "./tournament-section";
import { generateDwzReport } from "./dwz-report";

describe("generateDWZReport", () => {
  it("should generate the correct player section", () => {
    const table = generatePlayerSection(playerSectionData);
    expect(table).toBe(expectedPlayerSection);
  });

  it("should generate the correct header section", () => {
    const header = generatHeaderSection(headerSectionData);
    expect(header).toBe(expectedHeaderSection);
  });

  it("should generate the correct tournament section", () => {
    const tournament = generateTournamentSection(tournamentSectionData);
    expect(tournament).toBe(expectedTournamentSection);
  });

  it("should generate the correct dwz report", () => {
    const report = generateDwzReport(
      headerSectionData,
      playerSectionData,
      tournamentSectionData,
    );
    expect(report).toBe(expectedDwzReport);
  });
});

const playerSectionData: PlayerSectionData = [
  {
    endGroupPosition: 1,
    startingGroupPosition: 1,
    name: "Meißner,Felix",
    club: "HSK",
    fideId: "24671827",
    zpsClubId: "40023",
    zpsPlayerId: "1237",
    results: [
      {
        pieceColor: "W",
        result: "1",
        opponentEndGroupPosition: 10,
        round: 1,
      },
      {
        pieceColor: "W",
        result: "1",
        opponentEndGroupPosition: 2,
        round: 2,
      },
      {
        pieceColor: "B",
        result: "1",
        opponentEndGroupPosition: 3,
        round: 3,
      },
      {
        pieceColor: "W",
        result: "1",
        opponentEndGroupPosition: 4,
        round: 4,
      },
    ] satisfies Result[],
  },
  {
    endGroupPosition: 2,
    startingGroupPosition: 4,
    name: "Spiric,Igor",
    club: "HSK",
    fideId: "916609",
    results: [
      {
        pieceColor: "W",
        result: "R",
        opponentEndGroupPosition: 9,
        round: 1,
      },
      {
        pieceColor: "B",
        result: "0",
        opponentEndGroupPosition: 1,
        round: 2,
      },
      {
        pieceColor: "W",
        result: "1",
        opponentEndGroupPosition: 10,
        round: 3,
      },
      {
        pieceColor: "W",
        result: "R",
        opponentEndGroupPosition: 3,
        round: 4,
      },
    ] satisfies Result[],
  },
];

const headerSectionData: HeaderSectionData = {
  tournamentName: "HSK Klubturnier 2018 A-Gruppe",
  numberOfPlayers: 10,
  numberOfRounds: 9,
  groupNumber: 1,
};

const tournamentSectionData: TournamentSectionData = {
  startDate: new Date("2018-11-30"),
  endDate: new Date("2018-11-30"),
  user: "Nils Altenburg",
};

const expectedPlayerSection = ` ttt. rrr nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv lll ffffffffff pppppppppp gggggggg eeee dddd  zzzzz mmmm\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\r
   1.   1 Meißner,Felix                    HSK                                    24671827                                40023 1237  1W 10 1W  2 1B  3 1W  4\r
   2.   4 Spiric,Igor                      HSK                                      916609                                            RW  9 0B  1 1W 10 RW  3\r`;

const expectedHeaderSection = `HSK Klubturnier 2018 A-Gruppe\r
\r
ER  10  9  1 #910#\r`;

const expectedTournamentSection = `###\r
Name:\r
Ort:\r
FIDE-Land:\r
Datum(S):   30.11.2018           Datum(E):   30.11.2018\r
ZÅge(1):                         ZÅge(2):                         ZÅge(3):\r
Turnierorganisator:\r
Hauptschiedsrichter:\r
Weitere Schiedsrichter:\r
Anwender:        Nils Altenburg\r`;

const expectedDwzReport = `${expectedHeaderSection}\r
${expectedPlayerSection}\r
${expectedTournamentSection}\r`;

/**
 * TODO: Offene Fragen:
 * - Dürfen nach mmmm auffüllende Leerzeichen folgen?
 * - Ist \r als line separator erlaubt?
 * - Vereinsname? Zwingend Abkürzungen? Woher kennen wir diese?
 * - "ER  10  9  1 #910#" -> "?Erfassungsreport? 10 Spieler ?Gruppe Nummer 1? ?9 Runden? ???"
 * - Welche Rundenzahl wenn Spieler aus dem Turnier ausgeschieden sind?
 * - Tournament Informationen sehr unvollständig?
 * - Wer ist der Anwender?
 * - Whitespaces random platziert in der Datei? Egal?
 * - Start und Enddatum sind das gleiche Datum?
 */
