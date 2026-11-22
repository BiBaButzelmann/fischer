import { describe, test, expect } from "vitest";
import { groupParticipantsByStrength, matchesSearch } from "../roster";

function makeGroup(
  id: number,
  groupName: string,
  tier: number | null,
  groupNumber = id,
) {
  return { id, groupName, groupNumber, tier, dayOfWeek: null };
}

function makeParticipant(
  firstName: string,
  lastName: string,
  group: ReturnType<typeof makeGroup> | null,
) {
  return { profile: { firstName, lastName }, group: group ? { group } : null };
}

const groupA = makeGroup(1, "A", 0);
const groupB1 = makeGroup(2, "B1", 1, 2);
const groupB2 = makeGroup(3, "B2", 1, 3);
const groupWithoutTier = makeGroup(4, "X", null);

function sectionNames(
  sections: ReturnType<typeof groupParticipantsByStrength>,
) {
  return sections.map((section) => section.group?.groupName ?? null);
}

describe("groupParticipantsByStrength", () => {
  test("orders groups by tier, strongest first, then by group number", () => {
    const sections = groupParticipantsByStrength([
      makeParticipant("Ole", "Brandt", groupB2),
      makeParticipant("Lea", "Kowalczyk", groupA),
      makeParticipant("Paul", "Hinrichs", groupB1),
    ]);

    expect(sectionNames(sections)).toEqual(["A", "B1", "B2"]);
  });

  test("puts groups without tier after ranked groups and participants without group last", () => {
    const sections = groupParticipantsByStrength([
      makeParticipant("Clara", "Neumeister", null),
      makeParticipant("Mira", "Lindqvist", groupWithoutTier),
      makeParticipant("Jonas", "Petersen", groupA),
    ]);

    expect(sectionNames(sections)).toEqual(["A", "X", null]);
  });

  test("sorts members alphabetically by last name with German collation", () => {
    const [section] = groupParticipantsByStrength([
      makeParticipant("Svenja", "Thießen", groupA),
      makeParticipant("Jürgen", "Möller", groupA),
      makeParticipant("Kemal", "Aydın", groupA),
      makeParticipant("Max", "Moeller", groupA),
    ]);

    expect(section.participants.map((p) => p.profile.lastName)).toEqual([
      "Aydın",
      "Moeller",
      "Möller",
      "Thießen",
    ]);
  });

  test("returns no sections for no participants", () => {
    expect(groupParticipantsByStrength([])).toEqual([]);
  });
});

describe("matchesSearch", () => {
  const person = {
    firstName: "Svenja",
    lastName: "Thießen",
    email: "svenja.thiessen@posteo.de",
    phoneNumber: "0152 34907781",
  };

  test("matches every person for an empty query", () => {
    expect(matchesSearch(person, "  ")).toBe(true);
  });

  test("matches first name, last name and email case-insensitively", () => {
    expect(matchesSearch(person, "SVEN")).toBe(true);
    expect(matchesSearch(person, "posteo")).toBe(true);
    expect(matchesSearch(person, "petersen")).toBe(false);
  });

  test("ignores accents and spells ß as ss", () => {
    expect(matchesSearch({ ...person, lastName: "Müller" }, "muller")).toBe(
      true,
    );
    expect(matchesSearch(person, "thiessen")).toBe(true);
    expect(matchesSearch(person, "Thießen")).toBe(true);
  });

  test("requires every word to match", () => {
    expect(matchesSearch(person, "svenja thie")).toBe(true);
    expect(matchesSearch(person, "svenja müller")).toBe(false);
  });

  test("matches phone numbers by digits regardless of spacing", () => {
    expect(matchesSearch(person, "015234")).toBe(true);
    expect(matchesSearch(person, "4907 781")).toBe(true);
    expect(matchesSearch(person, "0170")).toBe(false);
  });
});
