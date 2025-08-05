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
import { GroupTitle } from "./group-title";
import { GroupStats } from "./group-stats";
import { GroupMatchEnteringHelperSelector } from "./group-match-entering-helper-selector";
import { Button } from "@/components/ui/button";
import { Trash, Save } from "lucide-react";
import { DayOfWeek } from "@/db/types/group";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";

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
  onSaveGroup,
  onUpdateGroupName,
  matchEnteringHelpers,
  helperAssignedCounts,
  helperAssignments,
  onAddHelperToGroup,
  onRemoveHelperFromGroup,
}: {
  tournamentId: number;
  groups: GridGroup[];
  unassignedParticipants: ParticipantWithName[];
  onChangeGroups: (groups: GridGroup[]) => void;
  onChangeUnassignedParticipants: (participants: ParticipantWithName[]) => void;
  onDeleteGroup: (groupId: number) => void;
  onSaveGroup: (group: GridGroup) => void;
  onUpdateGroupName: (groupId: number, newName: string) => void;
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  helperAssignedCounts: Record<number, number>;
  helperAssignments: Record<number, MatchEnteringHelperWithName[]>;
  onAddHelperToGroup: (groupId: number, helperId: string) => void;
  onRemoveHelperFromGroup: (groupId: number, helperId: number) => void;
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
    onUpdateGroupName(groupId, newName);
  };

  const handleChangeGroupMatchDay = (
    groupId: number,
    dayOfWeek: DayOfWeek | null,
  ) => {
    const updatedGroups = groups.map((g) =>
      g.id === groupId ? { ...g, dayOfWeek } : g,
    );
    onChangeGroups(updatedGroups);
  };

  const groupsWithHelpers = useMemo(() => {
    if (!matchEnteringHelpers || !helperAssignedCounts) {
      return groups;
    }

    return groups.map((group) => ({
      ...group,
      matchEnteringHelpers: helperAssignments?.[group.id] || [],
    }));
  }, [groups, helperAssignments, matchEnteringHelpers, helperAssignedCounts]);

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
            {groupsWithHelpers.map((group) => (
              <GroupContainer
                key={group.id}
                group={group}
                onChangeGroupName={handleChangeGroupName}
                onChangeGroupMatchDay={handleChangeGroupMatchDay}
                onDeleteGroup={onDeleteGroup}
                onSaveGroup={onSaveGroup}
                matchEnteringHelpers={matchEnteringHelpers}
                helperAssignedCounts={helperAssignedCounts}
                onAddHelperToGroup={onAddHelperToGroup}
                onRemoveHelperFromGroup={onRemoveHelperFromGroup}
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
  onSaveGroup,
  matchEnteringHelpers,
  helperAssignedCounts,
  onAddHelperToGroup,
  onRemoveHelperFromGroup,
}: {
  group: GridGroup;
  onChangeGroupName: (groupId: number, newName: string) => void;
  onChangeGroupMatchDay: (groupId: number, matchDay: DayOfWeek | null) => void;
  onDeleteGroup: (groupId: number) => void;
  onSaveGroup: (group: GridGroup) => void;
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  helperAssignedCounts: Record<number, number>;
  onAddHelperToGroup: (groupId: number, helperId: string) => void;
  onRemoveHelperFromGroup: (groupId: number, helperId: number) => void;
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
              <GroupTitle
                onChangeGroupName={onChangeGroupName}
                groupId={group.id}
                groupName={group.groupName}
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              className="text-blue-600 border-blue-600"
              onClick={() => onSaveGroup(group)}
            >
              <Save className="h-4 w-4" />
            </Button>
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
        <div className="space-y-4">
          <div className="px-2">
            <GroupMatchDay
              group={group}
              onChangeGroupMatchDay={onChangeGroupMatchDay}
            />
          </div>

          {/* Match Entering Helper Selector */}
          {matchEnteringHelpers &&
            helperAssignedCounts &&
            onAddHelperToGroup &&
            onRemoveHelperFromGroup && (
              <div className="px-2">
                <GroupMatchEnteringHelperSelector
                  matchEnteringHelpers={matchEnteringHelpers}
                  assignedHelpers={group.matchEnteringHelpers || []}
                  helperAssignedCounts={helperAssignedCounts}
                  onAddHelper={(helperId) =>
                    onAddHelperToGroup(group.id, helperId)
                  }
                  onRemoveHelper={(helperId) =>
                    onRemoveHelperFromGroup(group.id, helperId)
                  }
                />
              </div>
            )}

          {/* Participants */}
          <div>
            <SortableContext items={participantIds}>
              {group.participants.map((p) => (
                <ParticipantItem key={p.id} participant={p} />
              ))}
            </SortableContext>
          </div>

          {/* Group Stats */}
          <div className="px-2">
            <GroupStats group={group} />
          </div>
        </div>
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

    const newGroups = [...groups];
    let newUnassigned = [...unassignedParticipants];
    const participant = active.data.current?.participant;

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
      if (originalContainerId === UNASSIGNED_CONTAINER_ID) {
        const newUnassignedParticipants = [...unassignedParticipants];
        const oldIndex = unassignedParticipants.findIndex(
          (p) => p.id === active.id,
        );
        const newIndex = unassignedParticipants.findIndex(
          (p) => p.id === over.id,
        );
        return arrayMove(newUnassignedParticipants, oldIndex, newIndex);
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
