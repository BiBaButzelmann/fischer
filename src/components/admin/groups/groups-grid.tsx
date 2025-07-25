"use client";

import { ParticipantWithName } from "@/db/types/participant";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GridGroup } from "./types";
import { GroupMatchDay } from "./group-match-day";
import { ParticipantEntry } from "./participant-entry";
import { GroupDetails } from "./group-details";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { DayOfWeek } from "@/db/types/group";

export const UNASSIGNED_CONTAINER_ID = "unassigned-droppable";
const UNASSIGNED_CONTAINER_TYPE = "unassigned";
const GROUP_CONTAINER_TYPE = "group";
const PARTICIPANT_CONTAINER_TYPE = "participant";

export function GroupsGrid({
  groups,
  unassignedParticipants,
  onChangeGroups,
  onChangeUnassignedParticipants,
  onDeleteGroup,
}: {
  tournamentId: number;
  groups: GridGroup[];
  unassignedParticipants: ParticipantWithName[];
  onChangeGroups: (groups: GridGroup[]) => void;
  onChangeUnassignedParticipants: (participants: ParticipantWithName[]) => void;
  onDeleteGroup: (groupId: number) => void;
}) {
  const [activeItem, setActiveItem] = useState<ParticipantWithName | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Start dragging after 8px of movement
      },
    }),
  );

  const { handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop({
    groups,
    unassignedParticipants,
    onChangeGroups,
    onChangeUnassignedParticipants,
    onChangeActiveItem: setActiveItem,
  });

  const handleChangeGroupName = (groupId: number, newName: string) => {
    const updatedGroups = groups.map((g) =>
      g.id === groupId ? { ...g, groupName: newName } : g,
    );
    onChangeGroups(updatedGroups);
  };

  const handleChangeGroupMatchDay = (
    groupId: number,
    matchDay: DayOfWeek | null,
  ) => {
    const updatedGroups = groups.map((g) =>
      g.id === groupId ? { ...g, matchDay } : g,
    );
    onChangeGroups(updatedGroups);
  };

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
            {groups.map((group) => (
              <GroupContainer
                key={group.id}
                group={group}
                onChangeGroupName={handleChangeGroupName}
                onChangeGroupMatchDay={handleChangeGroupMatchDay}
                onDeleteGroup={onDeleteGroup}
              />
            ))}
            <UnassignedContainer participants={unassignedParticipants} />
          </div>
        </div>
        <DragOverlay>
          {activeItem ? (
            <ParticipantItem participant={activeItem} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export function GroupContainer({
  group,
  onChangeGroupName,
  onChangeGroupMatchDay,
  onDeleteGroup,
}: {
  group: GridGroup;
  onChangeGroupName: (groupId: number, newName: string) => void;
  onChangeGroupMatchDay: (groupId: number, matchDay: DayOfWeek | null) => void;
  onDeleteGroup: (groupId: number) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: group.id,
    data: {
      type: GROUP_CONTAINER_TYPE,
      group,
    },
  });

  const participantIds = useMemo(
    () => group.participants.map((p) => p.id),
    [group],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex gap-2">
            <div className="flex-1">
              <GroupDetails
                group={group}
                onChangeGroupName={onChangeGroupName}
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              className="text-destructive border-destructive"
              onClick={() => onDeleteGroup(group.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent
        ref={setNodeRef}
        className="p-0 pl-4 pb-4 pr-4 md:p-0 md:pl-6 md:pb-6 md:pr-6"
      >
        <div className="px-2 mb-2">
          <GroupMatchDay
            group={group}
            onChangeGroupMatchDay={onChangeGroupMatchDay}
          />
        </div>
        <SortableContext items={participantIds}>
          {group.participants.map((p) => (
            <ParticipantItem key={p.id} participant={p} />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export function UnassignedContainer({
  participants,
}: {
  participants: ParticipantWithName[];
}) {
  const { setNodeRef } = useDroppable({
    id: UNASSIGNED_CONTAINER_ID,
    data: {
      type: UNASSIGNED_CONTAINER_TYPE,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nicht zugewiesene Teilnehmer</CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef}>
        <SortableContext items={participants.map((p) => p.id)}>
          {participants.map((p) => (
            <ParticipantItem key={p.id} participant={p} />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export function ParticipantItem({
  participant,
  isOverlay,
}: {
  participant: ParticipantWithName;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: participant.id,
    data: {
      type: PARTICIPANT_CONTAINER_TYPE,
      participant,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overlayClasses = isOverlay ? "shadow-lg" : "";
  const draggingClasses = isDragging ? "opacity-30" : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-2 py-1 rounded-md shadow-sm cursor-grab active:cursor-grabbing ${draggingClasses} ${overlayClasses}`}
    >
      <ParticipantEntry participant={participant} />
    </div>
  );
}

function useDragAndDrop({
  groups,
  unassignedParticipants,
  onChangeGroups,
  onChangeUnassignedParticipants,
  onChangeActiveItem,
}: {
  groups: GridGroup[];
  unassignedParticipants: ParticipantWithName[];
  onChangeGroups: (groups: GridGroup[]) => void;
  onChangeUnassignedParticipants: (participants: ParticipantWithName[]) => void;
  onChangeActiveItem: (participant: ParticipantWithName | null) => void;
}) {
  const findContainerId = (id: number) => {
    if (unassignedParticipants.some((p) => p.id === id)) {
      return UNASSIGNED_CONTAINER_ID;
    }
    for (const group of groups) {
      if (group.participants.some((p) => p.id === id)) {
        return group.id;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    invariant(active.data.current, "Active data must be set");
    onChangeActiveItem(active.data.current?.participant as ParticipantWithName);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const originalContainerId = findContainerId(active.id as number);
    const overContainerId =
      over.data.current?.type === GROUP_CONTAINER_TYPE
        ? over.id
        : over.data.current?.type === UNASSIGNED_CONTAINER_TYPE
          ? UNASSIGNED_CONTAINER_ID
          : findContainerId(over.id as number);

    if (
      !originalContainerId ||
      !overContainerId ||
      originalContainerId === overContainerId
    ) {
      return;
    }

    // Handle moving an item to a new container
    const newGroups = [...groups];
    let newUnassigned = [...unassignedParticipants];
    const participant = active.data.current?.participant;

    // Remove from original container
    if (originalContainerId === UNASSIGNED_CONTAINER_ID) {
      newUnassigned = newUnassigned.filter((p) => p.id !== active.id);
    } else {
      const groupIndex = newGroups.findIndex(
        (g) => g.id === originalContainerId,
      );
      if (groupIndex > -1) {
        newGroups[groupIndex] = {
          ...newGroups[groupIndex],
          participants: newGroups[groupIndex].participants.filter(
            (p) => p.id !== active.id,
          ),
        };
      }
    }

    // Add to new container
    if (overContainerId === UNASSIGNED_CONTAINER_ID) {
      newUnassigned.push(participant);
    } else {
      const groupIndex = newGroups.findIndex((g) => g.id === overContainerId);
      if (groupIndex > -1) {
        newGroups[groupIndex] = {
          ...newGroups[groupIndex],
          participants: [...newGroups[groupIndex].participants, participant],
        };
      }
    }

    onChangeUnassignedParticipants(newUnassigned);
    onChangeGroups(newGroups);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    onChangeActiveItem(null);

    if (!over) return;

    const originalContainerId = findContainerId(active.id as number);
    const overContainerId =
      over.data.current?.type === GROUP_CONTAINER_TYPE
        ? over.id
        : over.data.current?.type === UNASSIGNED_CONTAINER_TYPE
          ? UNASSIGNED_CONTAINER_ID
          : findContainerId(over.id as number);

    if (
      !originalContainerId ||
      !overContainerId ||
      originalContainerId === overContainerId
    ) {
      // This handles re-ordering within the same list
      if (originalContainerId === UNASSIGNED_CONTAINER_ID) {
        const newUnassignedParticipants = [...unassignedParticipants];
        const oldIndex = unassignedParticipants.findIndex(
          (p) => p.id === active.id,
        );
        const newIndex = unassignedParticipants.findIndex(
          (p) => p.id === over.id,
        );
        return arrayMove(newUnassignedParticipants, oldIndex, newIndex);
        onChangeUnassignedParticipants(newUnassignedParticipants);
        return;
      } else {
        const groupIndex = groups.findIndex(
          (g) => g.id === originalContainerId,
        );
        const group = groups[groupIndex];
        const oldIndex = group.participants.findIndex(
          (p) => p.id === active.id,
        );
        const newIndex = group.participants.findIndex((p) => p.id === over.id);
        const newParticipants = arrayMove(
          group.participants,
          oldIndex,
          newIndex,
        );
        const newGroups = [...groups];
        newGroups[groupIndex] = { ...group, participants: newParticipants };
        onChangeGroups(newGroups);
      }
    }
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
