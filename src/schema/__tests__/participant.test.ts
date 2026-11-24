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

describe("participantFormSchema ratings and FIDE data", () => {
  function errorPaths(input: object) {
    const result = participantFormSchema.safeParse({ ...validBase, ...input });
    return result.success
      ? []
      : result.error.issues.map((issue) => issue.path.join("."));
  }

  test("rejects 0 as a rating", () => {
    expect(errorPaths({ dwzRating: 0, fideRating: 0 })).toEqual([
      "dwzRating",
      "fideRating",
    ]);
  });

  test("accepts an Elo without further FIDE data", () => {
    expect(errorPaths({ fideRating: 1800 })).toEqual([]);
  });

  test("accepts a FIDE ID without Elo and without further FIDE data", () => {
    expect(errorPaths({ fideId: "4467248" })).toEqual([]);
  });

  test("trims the FIDE ID", () => {
    const result = participantFormSchema.parse({
      ...validBase,
      fideId: " 4467248 ",
    });
    expect(result.fideId).toBe("4467248");
  });

  test("treats a blank FIDE ID as missing", () => {
    const result = participantFormSchema.parse({ ...validBase, fideId: "  " });
    expect(result.fideId).toBeUndefined();
  });
});
