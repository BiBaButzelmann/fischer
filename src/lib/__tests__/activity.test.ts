import { describe, test, expect } from "vitest";
import { buildActivityTimeline, computeParticipantChanges } from "../activity";

describe("buildActivityTimeline", () => {
  test("merges all event sources sorted by timestamp descending", () => {
    const timeline = buildActivityTimeline({
      accounts: [{ createdAt: new Date("2026-01-01T10:00:00Z") }],
      sessions: [{ createdAt: new Date("2026-01-05T09:00:00Z") }],
      registrations: [{ createdAt: new Date("2026-01-02T10:00:00Z") }],
      changes: [
        {
          createdAt: new Date("2026-01-03T10:00:00Z"),
          changes: { dwzRating: { old: 1850, new: 1870 } },
        },
      ],
      pageViews: [
        {
          createdAt: new Date("2026-01-04T10:00:00Z"),
          path: "/klubturnier-anmeldung",
        },
      ],
    });

    expect(timeline.map((e) => e.type)).toEqual([
      "login",
      "page_view",
      "updated",
      "registered",
      "account_created",
    ]);
    expect(timeline[1].path).toBe("/klubturnier-anmeldung");
    expect(timeline[2].changes).toEqual({ dwzRating: { old: 1850, new: 1870 } });
  });

  test("returns an empty array when there is no activity", () => {
    expect(buildActivityTimeline({})).toEqual([]);
  });
});

describe("computeParticipantChanges", () => {
  test("captures only fields whose values actually differ", () => {
    const changes = computeParticipantChanges(
      { dwzRating: 1850, chessClub: "HSK", fideId: null },
      { dwzRating: 1870, chessClub: "HSK", fideId: undefined },
    );

    expect(changes).toEqual({ dwzRating: { old: 1850, new: 1870 } });
  });

  test("treats arrays as sets so reordering is not a change", () => {
    const changes = computeParticipantChanges(
      { secondaryMatchDays: ["tuesday", "friday"] },
      { secondaryMatchDays: ["friday", "tuesday"] },
    );

    expect(changes).toEqual({});
  });
});
