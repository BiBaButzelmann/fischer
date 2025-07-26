import { describe, it, expect } from "vitest";
import { TableGenerator } from "./table-generator";

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
    expect(header).toBe("ID    Name                \r");
  });

  it("should handle border collapse correctly", () => {
    const generator = new TableGenerator();
    generator.addColumn("gender", "s", 1, "left", true);
    generator.addColumn("title", "TTT", 3, "right");
    const header = generator.generateHeader();
    expect(header).toBe("sTTT\r");
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
    expect(rows).toBe("1     Test User           \r");
  });
});
