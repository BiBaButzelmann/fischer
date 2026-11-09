import { afterEach, describe, test, expect, vi } from "vitest";
import {
  getDateTimeFromTournamentTime,
  getSetupHelperTimeFromTournamentTime,
  formatGameTimeByTournament,
  hasGameStarted,
} from "../game-time";

describe("getDateTimeFromTournamentTime", () => {
  test("builds the game start as Berlin time on the matchday", () => {
    const dt = getDateTimeFromTournamentTime("2026-12-10", "19:30:00");
    expect(dt.zoneName).toBe("Europe/Berlin");
    expect(dt.toISODate()).toBe("2026-12-10");
    expect(dt.hour).toBe(19);
    expect(dt.minute).toBe(30);
  });

  test("winter matchday: 19:30 Berlin is 18:30 UTC (CET, +1)", () => {
    const dt = getDateTimeFromTournamentTime("2026-12-10", "19:30:00");
    expect(dt.toUTC().toISO()).toBe("2026-12-10T18:30:00.000Z");
  });

  test("summer matchday: 19:30 Berlin is 17:30 UTC (CEST, +2)", () => {
    const dt = getDateTimeFromTournamentTime("2026-07-02", "19:30:00");
    expect(dt.toUTC().toISO()).toBe("2026-07-02T17:30:00.000Z");
  });
});

describe("getSetupHelperTimeFromTournamentTime", () => {
  test("is 30 minutes before game start on the same day", () => {
    const dt = getSetupHelperTimeFromTournamentTime("2026-12-10", "19:30:00");
    expect(dt.toISODate()).toBe("2026-12-10");
    expect(dt.hour).toBe(19);
    expect(dt.minute).toBe(0);
  });
});

describe("formatGameTimeByTournament", () => {
  test("formats HH:MM Uhr with padding", () => {
    expect(formatGameTimeByTournament("19:30:00")).toBe("19:30 Uhr");
    expect(formatGameTimeByTournament("9:05:00")).toBe("09:05 Uhr");
  });
});

describe("hasGameStarted", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("is false on the matchday before the game start", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-10T17:00:00Z"));
    expect(hasGameStarted("2026-12-10", "19:30:00")).toBe(false);
  });

  test("is true at the game start in Berlin time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-10T18:30:00Z"));
    expect(hasGameStarted("2026-12-10", "19:30:00")).toBe(true);
  });

  test("is true on a later day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-11T08:00:00Z"));
    expect(hasGameStarted("2026-12-10", "19:30:00")).toBe(true);
  });
});
