import { describe, test, expect, afterEach, vi } from "vitest";
import { participantFormSchema } from "../participant";

const validBase = {
  chessClubType: "hsk" as const,
  preferredMatchDay: "tuesday" as const,
  secondaryMatchDays: [],
};

describe("participantFormSchema birthDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("accepts a valid YYYY-MM-DD date", () => {
    const result = participantFormSchema.safeParse({
      ...validBase,
      birthDate: "1990-01-01",
    });
    expect(result.success).toBe(true);
  });

  test("rejects German or unpadded formats", () => {
    for (const birthDate of ["10.12.1990", "1990-1-1", "1990-12-9"]) {
      const result = participantFormSchema.safeParse({
        ...validBase,
        birthDate,
      });
      expect(result.success).toBe(false);
    }
  });

  test("rejects calendar-impossible dates", () => {
    for (const birthDate of ["1990-02-30", "1990-13-01", "1990-11-31"]) {
      const result = participantFormSchema.safeParse({
        ...validBase,
        birthDate,
      });
      expect(result.success).toBe(false);
    }
  });

  test("rejects a birth date in the future (Berlin today)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T12:00:00Z"));
    const result = participantFormSchema.safeParse({
      ...validBase,
      birthDate: "2026-07-03",
    });
    expect(result.success).toBe(false);
  });
});

describe("participantFormSchema notAvailableDays", () => {
  test("accepts up to 5 valid days", () => {
    const result = participantFormSchema.safeParse({
      ...validBase,
      notAvailableDays: [
        "2026-09-29",
        "2026-10-29",
        "2026-11-12",
        "2026-12-10",
        "2026-12-11",
      ],
    });
    expect(result.success).toBe(true);
  });

  test("rejects more than 5 days", () => {
    const result = participantFormSchema.safeParse({
      ...validBase,
      notAvailableDays: [
        "2026-09-29",
        "2026-10-29",
        "2026-11-12",
        "2026-12-10",
        "2026-12-11",
        "2026-12-15",
      ],
    });
    expect(result.success).toBe(false);
  });

  test("rejects timestamps and non-ISO strings", () => {
    for (const day of ["2026-12-10T00:00:00Z", "10.12.2026", "invalid"]) {
      const result = participantFormSchema.safeParse({
        ...validBase,
        notAvailableDays: [day],
      });
      expect(result.success).toBe(false);
    }
  });
});
