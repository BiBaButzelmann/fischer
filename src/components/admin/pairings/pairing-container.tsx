"use client";

import { useState } from "react";
import { GroupWithParticipantsAndGames } from "@/db/types/group";
import { GroupPositionManager } from "./group-position-manager";
import { Pairing } from "./pairing";

type Props = {
  tournamentId: number;
  groups: GroupWithParticipantsAndGames[];
};

export function PairingContainer({ tournamentId, groups }: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState<number>(groups[0].id);

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);

  return (
    <div className="flex gap-6">
      <div className="w-96 flex-shrink-0">
        <GroupPositionManager
          tournamentId={tournamentId}
          groups={groups}
          onGroupChange={handleGroupChange}
        />
      </div>

      <div className="flex-1 min-w-0">
        {selectedGroup ? (
          <Pairing group={selectedGroup} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-500">
            <span>Keine Gruppe ausgewählt</span>
          </div>
        )}
      </div>
    </div>
  );
}
