import { describe, test, expect } from "vitest";
import { buildActivityTimeline } from "../activity";

describe("buildActivityTimeline", () => {
  test("merges account, login and participant events sorted by timestamp descending", () => {
    const timeline = buildActivityTimeline({
      accounts: [{ createdAt: new Date("2026-01-01T10:00:00Z") }],
      sessions: [{ createdAt: new Date("2026-01-05T09:00:00Z") }],
      participants: [
        {
          createdAt: new Date("2026-01-02T10:00:00Z"),
          updatedAt: new Date("2026-01-02T10:00:00Z"),
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
      participants: [
        {
          createdAt: new Date("2026-01-02T10:00:00.000Z"),
          updatedAt: new Date("2026-01-02T10:00:00.200Z"),
        },
      ],
    });
    expect(justRegistered.map((e) => e.type)).toEqual(["registered"]);

    const laterEdited = buildActivityTimeline({
      participants: [
        {
          createdAt: new Date("2026-01-02T10:00:00.000Z"),
          updatedAt: new Date("2026-01-03T08:00:00.000Z"),
        },
      ],
    });
    expect(laterEdited.map((e) => e.type)).toEqual(["updated", "registered"]);
  });

  test("returns an empty array when there is no activity", () => {
    expect(buildActivityTimeline({})).toEqual([]);
  });
});
