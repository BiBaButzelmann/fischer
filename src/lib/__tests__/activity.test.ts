import { describe, test, expect } from "vitest";
import { buildActivityTimeline } from "../activity";

describe("buildActivityTimeline", () => {
  test("merges account, login and participant events sorted by timestamp descending", () => {
    const timeline = buildActivityTimeline({
      accountCreatedAt: new Date("2026-01-01T10:00:00Z"),
      sessions: [{ createdAt: new Date("2026-01-05T09:00:00Z") }],
      participants: [
        {
          createdAt: new Date("2026-01-02T10:00:00Z"),
          updatedAt: new Date("2026-01-02T10:00:00Z"),
          tournamentName: "Klubturnier 2026",
        },
      ],
    });

    expect(timeline.map((e) => e.type)).toEqual([
      "login",
      "registered",
      "account_created",
    ]);
  });

  test("emits an 'updated' event only when updatedAt meaningfully differs from createdAt", () => {
    const justRegistered = buildActivityTimeline({
      sessions: [],
      participants: [
        {
          createdAt: new Date("2026-01-02T10:00:00.000Z"),
          updatedAt: new Date("2026-01-02T10:00:00.200Z"),
          tournamentName: "Klubturnier 2026",
        },
      ],
    });
    expect(justRegistered.map((e) => e.type)).toEqual(["registered"]);

    const laterEdited = buildActivityTimeline({
      sessions: [],
      participants: [
        {
          createdAt: new Date("2026-01-02T10:00:00.000Z"),
          updatedAt: new Date("2026-01-03T08:00:00.000Z"),
          tournamentName: "Klubturnier 2026",
        },
      ],
    });
    expect(laterEdited.map((e) => e.type)).toEqual(["updated", "registered"]);
  });

  test("returns an empty array when there is no activity", () => {
    expect(buildActivityTimeline({ sessions: [], participants: [] })).toEqual([]);
  });
});
