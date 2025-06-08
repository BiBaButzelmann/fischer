"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticipantWithName } from "@/db/types/participant";
import { useEffect, useMemo, useRef, useState } from "react";
import { ParticipantEntry } from "./participant-entry";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/list-item";
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/dist/types/types";

type Props = {
  participants: ParticipantWithName[];
};
export function EditGroupsGrid({ participants }: Props) {
  const [groupData, setGroupData] = useState(() => {
    // TODO: hardcode group size for now, but it should be configurable / determined by the tournament settings
    return getParticipantsGroupDistribution(10, participants);
  });

  const handleGroupParticipantMove = (
    fromGroupId: number,
    toGroupId: number,
    participantId: number,
  ) => {
    setGroupData((prev) => {
      const newParticipantGroups = [...prev.participantGroups];
      const fromGroupIndex = fromGroupId - 1;
      const toGroupIndex = toGroupId - 1;

      // Find the participant in the from group
      const participantIndex = newParticipantGroups[fromGroupIndex].findIndex(
        (p) => p.id === participantId,
      );

      if (participantIndex === -1) return prev; // Participant not found

      // Remove from the from group and add to the to group
      const [participant] = newParticipantGroups[fromGroupIndex].splice(
        participantIndex,
        1,
      );
      newParticipantGroups[toGroupIndex].push(participant);

      return {
        ...prev,
        participantGroups: newParticipantGroups,
      };
    });
  };

  const handleUnassignedParticipantMove = (
    newGroupId: number,
    participantId: number,
  ) => {
    setGroupData((prev) => {
      const newParticipantGroups = [...prev.participantGroups];
      const groupIndex = newGroupId - 1;

      // Find the participant in the unassigned list
      const participantIndex = prev.unassignedParticipants.findIndex(
        (p) => p.id === participantId,
      );

      if (participantIndex === -1) return prev; // Participant not found

      // Remove from unassigned and add to the group
      const [participant] = prev.unassignedParticipants.splice(
        participantIndex,
        1,
      );
      newParticipantGroups[groupIndex].push(participant);

      return {
        ...prev,
        participantGroups: newParticipantGroups,
        unassignedParticipants: prev.unassignedParticipants,
      };
    });
  };

  const handleParticipantMoveToGroup = (
    fromGroupId: number | null,
    toGroupId: number,
    participantId: number,
  ) => {
    if (fromGroupId === null) {
      handleUnassignedParticipantMove(toGroupId, participantId);
    } else {
      handleGroupParticipantMove(fromGroupId, toGroupId, participantId);
    }
  };

  const handleParticipantMoveToUnassigned = (
    fromGroupId: number,
    participantId: number,
  ) => {
    setGroupData((prev) => {
      const newParticipantGroups = [...prev.participantGroups];
      const groupIndex = fromGroupId - 1;

      // Find the participant in the group
      const participantIndex = newParticipantGroups[groupIndex].findIndex(
        (p) => p.id === participantId,
      );

      if (participantIndex === -1) return prev; // Participant not found

      // Remove from the group and add to unassigned
      const [participant] = newParticipantGroups[groupIndex].splice(
        participantIndex,
        1,
      );

      return {
        ...prev,
        participantGroups: newParticipantGroups,
        unassignedParticipants: [...prev.unassignedParticipants, participant],
      };
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
        {groupData.participantGroups.map((group, index) => (
          <DroppableGroup
            key={index}
            groupId={index + 1}
            participants={group}
            onParticipantMove={handleParticipantMoveToGroup}
          />
        ))}
      </div>
      {groupData.unassignedParticipants.length > 0 && (
        <DroppableUnassignedParticipants
          participants={groupData.unassignedParticipants}
          onParticipantMove={handleParticipantMoveToUnassigned}
        />
      )}
    </div>
  );
}

function DroppableUnassignedParticipants({
  participants,
  onParticipantMove,
}: {
  participants: ParticipantWithName[];
  onParticipantMove: (fromGroupId: number, participantId: number) => void;
}) {
  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: ({ source }) => {
        setIsDraggedOver(false);

        invariant(source.data.id, "Source data must have participant id");
        if (source.data.groupId === null) {
          // If the source groupId is null, it means the participant is already unassigned
          return;
        }

        // TODO: typing
        onParticipantMove(
          source.data.groupId as number,
          source.data.id as number,
        );
      },
    });
  }, []);

  return (
    <Card className={`${isDraggedOver ? "ring-2 ring-primary" : ""}`} ref={ref}>
      <CardHeader>
        <CardTitle>Unassigned Participants</CardTitle>
      </CardHeader>
      <CardContent>
        {participants.map((p) => (
          <DraggableParticipantEntry
            key={p.id}
            groupId={null}
            participant={p}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function DroppableGroup({
  groupId,
  participants,
  onParticipantMove,
}: {
  groupId: number;
  participants: ParticipantWithName[];
  onParticipantMove: (
    fromGroupId: number | null,
    toGroupId: number,
    participantId: number,
  ) => void;
}) {
  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: ({ source }) => {
        setIsDraggedOver(false);
        invariant(source.data.id, "Source data must have participant id");

        onParticipantMove(
          source.data.groupId as number | null,
          groupId,
          source.data.id as number,
        );
      },
    });
  }, []);

  return (
    <Card className={`${isDraggedOver ? "ring-2 ring-primary" : ""}`} ref={ref}>
      <CardHeader>
        <CardTitle>Gruppe {groupId}</CardTitle>
      </CardHeader>
      <CardContent>
        {participants.map((p) => (
          <DraggableParticipantEntry
            key={p.id}
            groupId={groupId}
            participant={p}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function DraggableParticipantEntry({
  groupId,
  participant,
}: {
  groupId: number | null;
  participant: ParticipantWithName;
}) {
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
      getInitialData: () => ({ id: participant.id, groupId }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div
        className={`cursor-pointer relative ${isDragging ? "opacity-40" : ""}`}
      >
        <ParticipantEntry participant={participant} />
      </div>
    </div>
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
