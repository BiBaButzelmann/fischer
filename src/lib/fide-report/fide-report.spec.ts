import { generateFideReport } from "@/lib/fide-report";
import { generatePlayerSection } from "@/lib/fide-report/player-section";
import { generateTournamentSection } from "@/lib/fide-report/tournament-section";
import {
  PlayerSectionData,
  TournamentSectionData,
} from "@/lib/fide-report/types";
import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

describe("generateFideReport", () => {
  it("should generate the correct player section", () => {
    const table = generatePlayerSection(playerSectionData);
    expect(table).toBe(expectedPlayerSection);
  });

  it("should generate the correct tournament section", () => {
    const section = generateTournamentSection(
      tournamentSectionData,
      playerSectionData,
    );

    expect(section).toBe(expectedTournamentSection);
  });

  it("should generate the full FIDE report", () => {
    const report = generateFideReport(tournamentSectionData, playerSectionData);

    expect(report).toBe(expectedFideReport);
  });
});

const playerSectionData = [
  {
    index: 1,
    startingGroupPosition: 1,
    gender: "m",
    title: "",
    name: "Mueller,Kai",
    fideRating: 1960,
    fideNation: "GER",
    fideId: "12939455",
    birthYear: DateTime.local(1996, 1, 1),
    currentPoints: 2.0,
    currentGroupPosition: 1,
    results: [
      {
        scheduled: DateTime.local(2024, 9, 17),
        opponentGroupPosition: 10,
        pieceColor: "w",
        result: "1",
      },
      {
        scheduled: DateTime.local(2024, 9, 24),
        opponentGroupPosition: 2,
        pieceColor: "w",
        result: "1",
      },
    ],
  },
  {
    index: 1,
    startingGroupPosition: 3,
    gender: "m",
    title: "",
    name: "Stejskal,Manfred",
    fideRating: 1917,
    fideNation: "GER",
    fideId: "12926620",
    birthYear: DateTime.local(1952, 1, 1),
    currentPoints: 0.0,
    currentGroupPosition: 8,
    results: [
      {
        scheduled: DateTime.local(2024, 9, 24),
        opponentGroupPosition: 9,
        pieceColor: "b",
        result: "0",
      },
    ],
  },
] as PlayerSectionData;

const tournamentSectionData = {
  tournamentName: "HSK Klubturnier 2024 - B1-Gruppe",
  location: "Hamburg",
  federation: "GER",
  dateOfStart: DateTime.local(2024, 9, 17),
  dateOfEnd: DateTime.local(2024, 12, 10),
  numberOfPlayers: 10,
  numberOfRatedPlayers: 10,
  typeOfTournament: "Individual round robin",
  organizer: "Paul Jeken",
  timeControl: "2 Stunden 40 / Zuege, 30 min. Rest",
} as TournamentSectionData;

const expectedPlayerSection = `         1         2         3         4         5         6         7         8         9        10        11\r
12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890\r
DDD SSSS sTTT NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN RRRR FFF IIIIIIIIIII BBBB/BB/BB PPPP RRRR  1111 1 1  2222 2 2 \r
001    1 m    Mueller,Kai                       1960 GER    12939455 1996/00/00  2.0    1    10 w 1     2 w 1 \r
001    3 m    Stejskal,Manfred                  1917 GER    12926620 1952/00/00  0.0    8               9 b 0 \r`;

const expectedTournamentSection = `012 HSK Klubturnier 2024 - B1-Gruppe\r
022 Hamburg\r
032 GER\r
042 2024/09/17\r
052 2024/12/10\r
062 10\r
072 10\r
092 Individual round robin\r
102 Paul Jeken\r
122 2 Stunden 40 / Zuege, 30 min. Rest\r
132                                                                                        24/09/17  24/09/24 \r`;

const expectedFideReport = `${expectedTournamentSection}

${expectedPlayerSection}`;
