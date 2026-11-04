import { describe, expect, it } from "vitest";
import { generateDwzReport } from "./dwz-report";
import type { DwzReportInput } from "./types";

describe("generateDwzReport", () => {
  it("generates a FIDE TRF report with all rounds and round-robin byes", () => {
    const report = generateDwzReport(input);

    expect(report).toContain("012 HSK Klubturnier 2026 - A\r");
    expect(report).toContain("062 3\r");
    expect(report).toContain("072 2\r");
    expect(report).toContain("092 Individual round robin\r");
    expect(report).toContain("102 Thomas Stark\r");
    expect(report).toContain(
      "132                                                                                        26/09/01  26/09/08  26/09/15 \r",
    );

    const lines = report.split("\r\n");
    const playerLine = (startingPosition: number) =>
      lines.find((line) => line.startsWith(`001    ${startingPosition} `)) ??
      "";

    expect(playerLine(1)).toContain("Meissner,Felix");
    expect(playerLine(1)).toContain("1990/00/00");
    expect(playerLine(1)).toContain("2000 GER");
    expect(playerLine(1)).toContain("24671827");
    expect(playerLine(1)).toMatch(/2 w 1/);
    expect(playerLine(1)).toContain("0000 - Z");
    expect(playerLine(1)).toMatch(/3 b 1/);

    expect(playerLine(2)).toContain("Spiric,Igor");
    expect(playerLine(2)).toContain("1985/04/12");
    expect(playerLine(2)).toMatch(/1 b 0/);
    expect(playerLine(2)).toMatch(/3 w =/);
    expect(playerLine(2)).toContain("0000 - Z");

    expect(playerLine(3)).toContain("Muster,Anna");
    expect(playerLine(3)).toContain("2000/00/00");
    expect(playerLine(3)).toContain("0000 - Z");
    expect(playerLine(3)).toMatch(/2 b =/);
    expect(playerLine(3)).toMatch(/1 w 0/);

    expect(report.match(/0000 - Z/g)).toHaveLength(3);
    expect(report).not.toContain("0000 - -");
  });

  it("does not invent byes for even-sized groups", () => {
    const report = generateDwzReport({
      ...input,
      participants: input.participants.slice(0, 2),
      games: input.games.filter(
        (game) =>
          game.whiteParticipantId <= 2 && game.blackParticipantId <= 2,
      ),
      standings: input.standings.slice(0, 2),
    });

    expect(report).not.toContain("0000 - Z");
  });
});

const input: DwzReportInput = {
  tournamentName: "HSK Klubturnier 2026",
  groupName: "A",
  location: "Hamburg",
  startDate: "2026-09-01",
  endDate: "2026-12-15",
  timeLimit:
    "40 Züge in 90 Minuten, danach 30 Minuten für die letzte Phase, Zugabe pro Zug in Sekunden: 30",
  referee: "Thomas Stark",
  participants: [
    {
      id: 1,
      startingPosition: 1,
      firstName: "Felix",
      lastName: "Meißner",
      gender: "m",
      birthYear: 1990,
      fideId: "24671827",
      fideRating: 2000,
      dwzRating: 1900,
    },
    {
      id: 2,
      startingPosition: 2,
      firstName: "Igor",
      lastName: "Spiric",
      gender: "m",
      birthDate: "1985-04-12",
      nationality: "GER",
      dwzRating: 1800,
    },
    {
      id: 3,
      startingPosition: 3,
      firstName: "Anna",
      lastName: "Muster",
      gender: "f",
      birthYear: 2000,
    },
  ],
  games: [
    {
      round: 1,
      whiteParticipantId: 1,
      blackParticipantId: 2,
      result: "1:0",
      date: "2026-09-01",
    },
    {
      round: 2,
      whiteParticipantId: 2,
      blackParticipantId: 3,
      result: "½-½",
      date: "2026-09-08",
    },
    {
      round: 3,
      whiteParticipantId: 3,
      blackParticipantId: 1,
      result: "0:1",
      date: "2026-09-15",
    },
  ],
  standings: [
    { participantId: 1, points: 2.0 },
    { participantId: 2, points: 0.5 },
    { participantId: 3, points: 0.5 },
  ],
};
