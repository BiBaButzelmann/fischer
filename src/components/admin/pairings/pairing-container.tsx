"use client";

import { useState } from "react";
import { GroupWithParticipants, GroupWithGames } from "@/db/types/group";
import { GroupPositionManager } from "./group-position-manager";
import { Pairing } from "./pairing";

type GroupPairingsContainerProps = {
  tournamentId: number;
  groups: GroupWithParticipants[];
  groupsWithGames: GroupWithGames[];
};

export function PairingContainer({
  tournamentId,
  groups,
  groupsWithGames,
}: GroupPairingsContainerProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(
    groups.length > 0 ? groups[0].id : null,
  );

  const handleGroupChange = (groupId: number | null) => {
    setSelectedGroupId(groupId);
  };

  const selectedGroupWithGames = selectedGroupId
    ? groupsWithGames.find((group) => group.id === selectedGroupId)
    : undefined;

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Keine Gruppen gefunden. Erstellen Sie zuerst Gruppen.
      </div>
    );
  }

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
        <Pairing group={selectedGroupWithGames} />
      </div>
    </div>
  );
}
