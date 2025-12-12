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
  tournamentName: "Klubturnier 2025",
  location: "Hamburg",
  startDate: new Date("2025-09-16"),
  endDate: new Date("2025-12-12"),
  timeLimit:
    "40 Züge in 90 Minuten, danach 0 Züge in 0 Minuten, 30 Minuten für die letzte Phase, Zugabe pro Zug in Sekunden: 30",
  tournamentOrganizer: "Arne Alpers",
  mainReferee: "Thomas Stark",
};

const expectedPlayerSection = ` ttt. rrr nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv lll ffffffffff pppppppppp gggggggg eeee dddd  zzzzz mmmm\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020\r
   1.   1 Meißner,Felix                    HSK                                    24671827                                40023 1237  1W 10 1W  2 1B  3 1W  4\r
   2.   4 Spiric,Igor                      HSK                                      916609                                            RW  9 0B  1 1W 10 RW  3\r`;

const expectedHeaderSection = `HSK Klubturnier 2018 A-Gruppe\r
\r
ER  10  9  1\r`;

const expectedTournamentSection = `###\r
Name: Klubturnier 2025\r
Ort: Hamburg\r
Datum(S):   16.9.2025           Datum(E):   12.12.2025\r
Z¸ge: 40 Züge in 90 Minuten, danach 0 Züge in 0 Minuten, 30 Minuten für die letzte Phase, Zugabe pro Zug in Sekunden: 30\r
Turnierorganisator: Arne Alpers\r
Hauptschiedsrichter: Thomas Stark\r`;

const expectedDwzReport = `${expectedHeaderSection}\r
${expectedPlayerSection}\r
${expectedTournamentSection}\r`;
