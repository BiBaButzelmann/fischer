"use client";

import { ParticipantWithName } from "@/db/types/participant";
import { useState } from "react";
import { GroupsGrid } from "./groups-grid";

type Props = {
  participants: ParticipantWithName[];
};
export function EditGroupsGrid({ participants }: Props) {
  const [groupData, setGroupData] = useState(() => {
    // TODO: hardcode group size for now, but it should be configurable / determined by the tournament settings
    return getParticipantsGroupDistribution(10, participants);
  });

  return (
    <GroupsGrid
      groups={groupData.participantGroups.map((participants, i) => ({
        id: i,
        name: `Gruppe ${i + 1}`,
        participants,
      }))}
    />
  );
}

function getParticipantsGroupDistribution(
  groupSize: number,
  participants: ParticipantWithName[],
): {
  participantGroups: ParticipantWithName[][];
  unassignedParticipants: ParticipantWithName[];
} {
  // assume participants are already sorted by fide rating
  const totalGroups = Math.floor(participants.length / groupSize);
  const totalAssignable = totalGroups * groupSize;

  const participantGroups: ParticipantWithName[][] = [];
  for (let i = 0; i < totalAssignable; i += groupSize) {
    participantGroups.push(participants.slice(i, i + groupSize));
  }

  const unassignedParticipants = participants.slice(totalAssignable);

  return {
    participantGroups,
    unassignedParticipants,
  };
}
