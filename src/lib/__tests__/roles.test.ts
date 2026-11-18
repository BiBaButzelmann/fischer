import { describe, test, expect } from "vitest";
import { groupRolesByProfileId } from "../roles";

function member(id: number, profileId: number) {
  return { id, profile: { id: profileId } };
}

const noMembers = {
  participant: [],
  referee: [],
  juror: [],
  matchEnteringHelper: [],
  setupHelper: [],
  trainer: [],
};

describe("groupRolesByProfileId", () => {
  test("collects every role record a profile holds", () => {
    const participant = member(11, 1);
    const referee = member(21, 1);
    const trainer = member(31, 2);

    const rolesByProfileId = groupRolesByProfileId({
      ...noMembers,
      participant: [participant],
      referee: [referee],
      trainer: [trainer],
    });

    expect(rolesByProfileId).toEqual({
      1: { participant, referee },
      2: { trainer },
    });
  });

  test("keeps the role record itself", () => {
    const participant = member(11, 1);

    const rolesByProfileId = groupRolesByProfileId({
      ...noMembers,
      participant: [participant],
    });

    expect(rolesByProfileId[1].participant).toBe(participant);
  });

  test("has no entry for profiles without a role", () => {
    expect(groupRolesByProfileId(noMembers)).toEqual({});
  });
});
