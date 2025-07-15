"use client";

import { useState } from "react";
import { GroupWithParticipantsAndGames } from "@/db/types/group";
import { GroupPositionManager } from "./group-position-manager";
import { Pairing } from "./pairing";

type GroupPairingsContainerProps = {
  tournamentId: number;
  groups: GroupWithParticipantsAndGames[];
};

export function PairingContainer({
  tournamentId,
  groups,
}: GroupPairingsContainerProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number>(groups[0].id);

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);

  return (
    <div className="flex gap-6">
      {/* Left side: Group selector and participants */}
      <div className="w-96 flex-shrink-0">
        <GroupPositionManager
          tournamentId={tournamentId}
          groups={groups}
          onGroupChange={handleGroupChange}
        />
      </div>

      {/* Right side: Pairings for selected group */}
      <div className="flex-1 min-w-0">
        <Pairing group={selectedGroup} />
      </div>
    </div>
  );
}
