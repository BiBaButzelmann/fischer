import { generateFideReport } from "@/lib/fide-report";
import { TableGenerator } from "@/lib/table-generator";
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
  it("should generate the correct table", () => {
    const table = generateFideReport([
      {
        index: 1,
        startingGroupPosition: 1,
        gender: "m",
        title: "",
        name: "Mueller,Kai",
        fideRating: 1960,
        fideNation: "GER",
        fideId: "12939455",
        birthYear: new Date(1996, 1, 1), // Month/day are 00 in example, using 01 here.
        currentPoints: 2.0,
        currentGroupPosition: 1,
        results: [
          {
            scheduled: new Date(2017, 9, 16),
            opponentGroupPosition: 10,
            pieceColor: "w",
            result: "1",
          },
          {
            scheduled: new Date(2017, 9, 23),
            opponentGroupPosition: 2,
            pieceColor: "w",
            result: "1",
          },
        ],
      },
    ]);
    expect(table).toBe(
      `DDD SSSS sTTT NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN RRRR FFF IIIIIIIIIII BBBB/BB/BB PPPP RRRR  1111 1 1  2222 2 2 
001    1 m    Mueller,Kai                       1960 GER    12939455 1996/00/00  2.0    1    10 w 1     2 w 1 `,
    );
  });
});
