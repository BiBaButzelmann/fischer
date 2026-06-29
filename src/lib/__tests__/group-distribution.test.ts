import { describe, test, expect } from "vitest";
import {
  distributeParticipantsByTwzAndDay,
  type DistributableGroup,
} from "../group-distribution";
import type { ParticipantWithName } from "@/db/types/participant";
import type { DayOfWeek } from "@/db/types/group";

function makeParticipant(
  fideRating: number | null,
  dwzRating: number | null,
  lastName: string,
  preferredMatchDay: DayOfWeek,
  secondaryMatchDays: DayOfWeek[] = [],
): ParticipantWithName {
  return {
    fideRating,
    dwzRating,
    preferredMatchDay,
    secondaryMatchDays,
    profile: { firstName: "Test", lastName },
  } as ParticipantWithName;
}

function makeGroup(
  id: number,
  groupNumber: number,
  tier: number | null,
  dayOfWeek: DayOfWeek | null,
  participants: ParticipantWithName[] = [],
): DistributableGroup {
  return { id, groupNumber, tier, dayOfWeek, participants };
}

function assignedNames(
  result: ReturnType<typeof distributeParticipantsByTwzAndDay>,
  groupId: number,
): string[] {
  return (result.assignmentsByGroupId.get(groupId) ?? []).map(
    (p) => p.profile.lastName,
  );
}

function unassignedNames(
  result: ReturnType<typeof distributeParticipantsByTwzAndDay>,
): string[] {
  return result.newUnassigned.map((p) => p.profile.lastName);
}

describe("distributeParticipantsByTwzAndDay", () => {
  test("empty input", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [],
      unassigned: [],
      participantsPerGroup: 4,
    });
    expect(result.assignmentsByGroupId.size).toBe(0);
    expect(result.newUnassigned).toEqual([]);
  });

  test("no unassigned -> groups untouched", () => {
    const seeded = makeParticipant(2000, null, "Seed", "tuesday");
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 0, "tuesday", [seeded])],
      unassigned: [],
      participantsPerGroup: 4,
    });
    expect(result.assignmentsByGroupId.size).toBe(0);
    expect(result.newUnassigned).toEqual([]);
  });

  test("fills strongest-first and respects capacity", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 0, "tuesday")],
      unassigned: [
        makeParticipant(1400, null, "D", "tuesday"),
        makeParticipant(2000, null, "A", "tuesday"),
        makeParticipant(1600, null, "C", "tuesday"),
        makeParticipant(1800, null, "B", "tuesday"),
      ],
      participantsPerGroup: 3,
    });
    expect(assignedNames(result, 1)).toEqual(["A", "B", "C"]);
    expect(unassignedNames(result)).toEqual(["D"]);
  });

  test("day is a hard constraint -> unplaceable stays unassigned", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 0, "tuesday")],
      unassigned: [makeParticipant(2000, null, "Solo", "thursday")],
      participantsPerGroup: 3,
    });
    expect(result.assignmentsByGroupId.size).toBe(0);
    expect(unassignedNames(result)).toEqual(["Solo"]);
  });

  test("cascade: strong player without A-day drops to a lower class; weaker fills A", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 0, "friday"), makeGroup(2, 2, 1, "tuesday")],
      unassigned: [
        makeParticipant(2200, null, "Strong", "tuesday"),
        makeParticipant(1500, null, "Weak", "friday"),
      ],
      participantsPerGroup: 2,
    });
    expect(assignedNames(result, 2)).toEqual(["Strong"]);
    expect(assignedNames(result, 1)).toEqual(["Weak"]);
  });

  test("strongest class fills before the next class", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 0, "tuesday"), makeGroup(2, 2, 1, "tuesday")],
      unassigned: [
        makeParticipant(2000, null, "P1", "tuesday"),
        makeParticipant(1900, null, "P2", "tuesday"),
        makeParticipant(1800, null, "P3", "tuesday"),
        makeParticipant(1700, null, "P4", "tuesday"),
        makeParticipant(1600, null, "P5", "tuesday"),
      ],
      participantsPerGroup: 4,
    });
    expect(assignedNames(result, 1)).toEqual(["P1", "P2", "P3", "P4"]);
    expect(assignedNames(result, 2)).toEqual(["P5"]);
  });

  test("parallel groups stay balanced in size and strength", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 1, "tuesday"), makeGroup(2, 2, 1, "tuesday")],
      unassigned: [
        makeParticipant(1900, null, "a", "tuesday"),
        makeParticipant(1850, null, "b", "tuesday"),
        makeParticipant(1800, null, "c", "tuesday"),
        makeParticipant(1750, null, "d", "tuesday"),
      ],
      participantsPerGroup: 4,
    });
    expect(assignedNames(result, 1)).toEqual(["a", "d"]);
    expect(assignedNames(result, 2)).toEqual(["b", "c"]);
  });

  test("balance: fewest members first (pre-seeded group is deprioritized)", () => {
    const seededB1 = [
      makeParticipant(1900, null, "s1", "tuesday"),
      makeParticipant(1850, null, "s2", "tuesday"),
    ];
    const result = distributeParticipantsByTwzAndDay({
      groups: [
        makeGroup(1, 1, 1, "tuesday", seededB1),
        makeGroup(2, 2, 1, "tuesday"),
      ],
      unassigned: [makeParticipant(1700, null, "new", "tuesday")],
      participantsPerGroup: 4,
    });
    expect(assignedNames(result, 2)).toEqual(["new"]);
    expect(result.assignmentsByGroupId.has(1)).toBe(false);
  });

  test("balance tie-break by lowest average TWZ", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [
        makeGroup(1, 1, 1, "tuesday", [
          makeParticipant(1900, null, "s1", "tuesday"),
        ]),
        makeGroup(2, 2, 1, "tuesday", [
          makeParticipant(1500, null, "s2", "tuesday"),
        ]),
      ],
      unassigned: [makeParticipant(1700, null, "new", "tuesday")],
      participantsPerGroup: 4,
    });
    expect(assignedNames(result, 2)).toEqual(["new"]);
  });

  test("unrated member counts as lowest average -> that group filled first", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [
        makeGroup(1, 1, 1, "tuesday", [
          makeParticipant(1500, null, "rated", "tuesday"),
        ]),
        makeGroup(2, 2, 1, "tuesday", [
          makeParticipant(null, null, "unrated", "tuesday"),
        ]),
      ],
      unassigned: [makeParticipant(1700, null, "new", "tuesday")],
      participantsPerGroup: 4,
    });
    expect(assignedNames(result, 2)).toEqual(["new"]);
  });

  test("unrated players are placed last into remaining compatible slots", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 0, "tuesday")],
      unassigned: [
        makeParticipant(null, null, "Unrated", "tuesday"),
        makeParticipant(1800, null, "Rated", "tuesday"),
      ],
      participantsPerGroup: 2,
    });
    expect(assignedNames(result, 1)).toEqual(["Rated", "Unrated"]);
  });

  test("class beats preferred day (precedence)", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 0, "thursday"), makeGroup(2, 2, 1, "tuesday")],
      unassigned: [makeParticipant(1800, null, "P", "tuesday", ["thursday"])],
      participantsPerGroup: 4,
    });
    expect(assignedNames(result, 1)).toEqual(["P"]);
  });

  test("preferred day beats secondary day within the same class", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 1, "tuesday"), makeGroup(2, 2, 1, "thursday")],
      unassigned: [makeParticipant(1800, null, "P", "tuesday", ["thursday"])],
      participantsPerGroup: 4,
    });
    expect(assignedNames(result, 1)).toEqual(["P"]);
  });

  test("null-day (wildcard) is the lowest day bucket", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 1, "thursday"), makeGroup(2, 2, 1, null)],
      unassigned: [makeParticipant(1800, null, "P", "tuesday", ["thursday"])],
      participantsPerGroup: 4,
    });
    expect(assignedNames(result, 1)).toEqual(["P"]);
  });

  test("null tier is treated as the weakest class", () => {
    const full = distributeParticipantsByTwzAndDay({
      groups: [
        makeGroup(1, 1, 1, "tuesday", [
          makeParticipant(1800, null, "x", "tuesday"),
          makeParticipant(1700, null, "y", "tuesday"),
        ]),
        makeGroup(2, 2, null, "tuesday"),
      ],
      unassigned: [makeParticipant(1600, null, "P", "tuesday")],
      participantsPerGroup: 2,
    });
    expect(assignedNames(full, 2)).toEqual(["P"]);

    const open = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 1, "tuesday"), makeGroup(2, 2, null, "tuesday")],
      unassigned: [makeParticipant(1600, null, "P", "tuesday")],
      participantsPerGroup: 2,
    });
    expect(assignedNames(open, 1)).toEqual(["P"]);
  });

  test("groupNumber is the final tie-break", () => {
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(10, 3, 1, "tuesday"), makeGroup(11, 2, 1, "tuesday")],
      unassigned: [makeParticipant(1800, null, "P", "tuesday")],
      participantsPerGroup: 4,
    });
    expect(assignedNames(result, 11)).toEqual(["P"]);
  });

  test("invariant: every player is either assigned exactly once or unassigned", () => {
    const players = [
      makeParticipant(2000, null, "A", "tuesday"),
      makeParticipant(1800, null, "B", "friday"),
      makeParticipant(1600, null, "C", "tuesday", ["friday"]),
      makeParticipant(null, null, "D", "thursday"),
    ];
    const result = distributeParticipantsByTwzAndDay({
      groups: [makeGroup(1, 1, 0, "tuesday"), makeGroup(2, 2, 1, "friday")],
      unassigned: players,
      participantsPerGroup: 2,
    });
    const assigned = [...result.assignmentsByGroupId.values()].flat();
    const all = [...assigned, ...result.newUnassigned];
    expect(all).toHaveLength(players.length);
    expect(new Set(all.map((p) => p.profile.lastName)).size).toBe(
      players.length,
    );
  });

  test("does not mutate the input groups or participants array", () => {
    const groupParticipants = [makeParticipant(1900, null, "seed", "tuesday")];
    const groups = [makeGroup(1, 1, 1, "tuesday", groupParticipants)];
    const unassigned = [makeParticipant(1700, null, "new", "tuesday")];
    distributeParticipantsByTwzAndDay({
      groups,
      unassigned,
      participantsPerGroup: 4,
    });
    expect(groupParticipants).toHaveLength(1);
    expect(groups[0].participants).toBe(groupParticipants);
    expect(unassigned).toHaveLength(1);
  });
});
