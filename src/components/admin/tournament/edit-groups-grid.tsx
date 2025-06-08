"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticipantWithName } from "@/db/types/participant";
import { useMemo } from "react";
import { ParticipantEntry } from "./participant-entry";

type Props = {
  participants: ParticipantWithName[];
};
export function EditGroupsGrid({ participants }: Props) {
  const { participantGroups, unassignedParticipants } = useMemo(() => {
    // TODO: hardcode group size for now, but it should be configurable / determined by the tournament settings
    return getParticipantsGroupDistribution(10, participants);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
        {participantGroups.map((group, index) => (
          <Group key={index} groupId={index + 1} participants={group} />
        ))}
      </div>
      {unassignedParticipants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Participants</CardTitle>
          </CardHeader>
          <CardContent>
            {unassignedParticipants.map((p) => (
              <ParticipantEntry key={p.id} participant={p} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Group({
  groupId,
  participants,
}: {
  groupId: number;
  participants: ParticipantWithName[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gruppe {groupId}</CardTitle>
      </CardHeader>
      <CardContent>
        {participants.map((p) => (
          <ParticipantEntry key={p.id} participant={p} />
        ))}
      </CardContent>
    </Card>
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
