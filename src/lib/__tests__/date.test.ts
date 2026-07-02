import { describe, test, expect, afterEach, vi } from "vitest";
import {
  parseDateOnly,
  toDateOnly,
  utcDateToDateOnly,
  todayDateOnly,
  formatDateOnly,
} from "../date";

describe("parseDateOnly", () => {
  test("interprets the string as a Berlin calendar day", () => {
    const dt = parseDateOnly("2026-12-10");
    expect(dt.zoneName).toBe("Europe/Berlin");
    expect(dt.year).toBe(2026);
    expect(dt.month).toBe(12);
    expect(dt.day).toBe(10);
    expect(dt.weekday).toBe(4);
  });

  test("round-trips through toDateOnly", () => {
    expect(toDateOnly(parseDateOnly("2026-12-10"))).toBe("2026-12-10");
    expect(toDateOnly(parseDateOnly("2026-01-01"))).toBe("2026-01-01");
  });
});

describe("utcDateToDateOnly", () => {
  test("keeps the calendar day of a UTC-midnight picker date", () => {
    expect(utcDateToDateOnly(new Date("2026-12-10T00:00:00Z"))).toBe(
      "2026-12-10",
    );
  });

  test("regression: Berlin winter local midnight is NOT shifted when picker runs in UTC", () => {
    const berlinLocalMidnightAsUtc = new Date("2026-12-09T23:00:00Z");
    expect(utcDateToDateOnly(berlinLocalMidnightAsUtc)).toBe("2026-12-09");
    const pickerUtcDate = new Date("2026-12-10T00:00:00Z");
    expect(utcDateToDateOnly(pickerUtcDate)).toBe("2026-12-10");
  });
});

describe("formatDateOnly", () => {
  test("formats German day.month.year with padding", () => {
    expect(formatDateOnly("2026-12-10")).toBe("10.12.2026");
    expect(formatDateOnly("2026-01-05")).toBe("05.01.2026");
  });
});

describe("todayDateOnly", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns the Berlin calendar day, not the UTC day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-09T23:30:00Z"));
    expect(todayDateOnly()).toBe("2026-12-10");
  });

  test("agrees with UTC during the day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-10T12:00:00Z"));
    expect(todayDateOnly()).toBe("2026-12-10");
  });
});

describe("date-only string comparisons", () => {
  test("ISO strings compare lexicographically in day order", () => {
    expect("2026-01-05" < "2026-12-10").toBe(true);
    expect("2026-12-09" < "2026-12-10").toBe(true);
    expect("2025-12-31" < "2026-01-01").toBe(true);
  });
});
