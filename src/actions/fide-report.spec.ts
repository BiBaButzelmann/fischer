import { generatePlayerSection } from "@/lib/fide-report/player-section";
import { generateTournamentSection } from "@/lib/fide-report/tournament-section";
import {
  PlayerSectionData,
  TournamentSectionData,
} from "@/lib/fide-report/types";
import { TableGenerator } from "@/lib/table-generator";
import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

describe("TableGenerator", () => {
  it("should pad left alignment correctly", () => {
    const generator = new TableGenerator();
    generator.addColumn("id", "test", 6, "left");
    expect(generator.padCellValue("id", "test")).toBe("test  ");
  });

  it("should pad center alignment correctly", () => {
    const generator = new TableGenerator();
    generator.addColumn("id", "test", 6, "center");
    expect(generator.padCellValue("id", "test")).toBe(" test ");
  });

  it("should pad right alignment correctly", () => {
    const generator = new TableGenerator();
    generator.addColumn("id", "test", 6, "right");
    expect(generator.padCellValue("id", "test")).toBe("  test");
  });

  it("should generate headers with correct padding", () => {
    const generator = new TableGenerator();
    generator.addColumn("id", "ID", 5, "left");
    generator.addColumn("name", "Name", 20, "left");
    const header = generator.generateHeader();
    expect(header).toBe("ID    Name                ");
  });

  it("should handle border collapse correctly", () => {
    const generator = new TableGenerator();
    generator.addColumn("gender", "s", 1, "left", true);
    generator.addColumn("title", "TTT", 3, "right");
    const header = generator.generateHeader();
    expect(header).toBe("sTTT");
  });

  it("should generate padded rows correctly", () => {
    const generator = new TableGenerator();
    generator.addColumn("id", "ID", 5, "left");
    generator.addColumn("name", "Name", 20, "left");
    generator.addRowValues([
      { id: "id", data: "1" },
      { id: "name", data: "Test User" },
    ]);
    const rows = generator.generateRows();
    expect(rows).toBe("1     Test User           ");
  });
});

describe("generateFideReport", () => {
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

  it("should generate the correct player section", () => {
    const table = generatePlayerSection(playerSectionData);
    expect(table).toBe(
      `         1         2         3         4         5         6         7         8         9        10        11
12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
DDD SSSS sTTT NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN RRRR FFF IIIIIIIIIII BBBB/BB/BB PPPP RRRR  1111 1 1  2222 2 2 
001    1 m    Mueller,Kai                       1960 GER    12939455 1996/00/00  2.0    1    10 w 1     2 w 1 
001    3 m    Stejskal,Manfred                  1917 GER    12926620 1952/00/00  0.0    8               9 b 0 `,
    );
  });

  it("should generate the correct tournament section", () => {
    const section = generateTournamentSection(
      tournamentSectionData,
      playerSectionData,
    );

    expect(section).toBe(`012 HSK Klubturnier 2024 - B1-Gruppe 
022 Hamburg
032 GER
042 2024/09/17
052 2024/12/10
062 10
072 10
092 Individual round robin
102 Paul Jeken
122 2 Stunden 40 / Zuege, 30 min. Rest
132                                                                                        24/09/17  24/09/24 `);
  });
});
