"use client";

import { ParticipantWithName } from "@/db/types/participant";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FormEvent, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GridGroup } from "./types";
import { GroupMatchDay } from "./group-match-day";
import { ParticipantEntry } from "./participant-entry";
import { GroupTitle } from "./group-title";
import { GroupStats } from "./group-stats";
import { GroupMatchEnteringHelperSelector } from "../match-entering-helper/match-entering-helper-selector";
import { Button } from "@/components/ui/button";
import { Trash, FastForward } from "lucide-react";
import { DayOfWeek } from "@/db/types/group";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sortParticipantsByDwz } from "@/lib/elo";

export const UNASSIGNED_CONTAINER_ID = "unassigned-droppable";
const UNASSIGNED_CONTAINER_TYPE = "unassigned";
const GROUP_CONTAINER_TYPE = "group";
const PARTICIPANT_CONTAINER_TYPE = "participant";

export function GroupsGrid({
  groups,
  unassignedParticipants,
  matchEnteringHelpers,
  helperAssignedCounts,
  onChangeGroups,
  onChangeUnassignedParticipants,
  onDeleteGroup,
  onUpdateGroupName,
  onAddHelperToGroup,
  onRemoveHelperFromGroup,
  onDistributeParticipants,
}: {
  tournamentId: number;
  groups: GridGroup[];
  unassignedParticipants: ParticipantWithName[];
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  helperAssignedCounts: Record<number, number>;
  helperAssignments: Record<number, MatchEnteringHelperWithName[]>;
  onChangeGroups: (groups: GridGroup[]) => void;
  onChangeUnassignedParticipants: (participants: ParticipantWithName[]) => void;
  onDeleteGroup: (groupId: number) => void;
  onUpdateGroupName: (groupId: number, newName: string) => void;
  onAddHelperToGroup: (groupId: number, helperId: number) => void;
  onRemoveHelperFromGroup: (groupId: number, helperId: number) => void;
  onDistributeParticipants: (participantsPerGroup: number) => void;
}) {
  const participantsGroupMap = useMemo(() => {
    const map: Record<number, number> = {};
    groups.forEach((group) => {
      if (group.isDeleted) return;
      group.participants.forEach((participant) => {
        map[participant.id] = group.id;
      });
    });
    return map;
  }, [groups]);

  const [overContainerId, setOverContainerId] =
    useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Start dragging after 8px of movement
      },
    }),
  );

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

  const moveParticipantToNewGroup = (
    participantId: number,
    sourceGroupId: number,
    destinationGroupId: number,
  ) => {
    const updatedGroups = [...groups];
    const sourceGroup = updatedGroups.find((g) => g.id === sourceGroupId);
    const destinationGroup = updatedGroups.find(
      (g) => g.id === destinationGroupId,
    );
    invariant(sourceGroup, "Source group not found");
    invariant(destinationGroup, "Destination group not found");

    const participant = sourceGroup.participants.find(
      (p) => p.id === participantId,
    );
    invariant(participant, "Participant not found");

    sourceGroup.participants = sourceGroup.participants.filter(
      (p) => p.id !== participantId,
    );
    destinationGroup.participants.push(participant);

    onChangeGroups(updatedGroups);
  };

  const moveParticipantToUnassigned = (
    participantId: number,
    sourceGroupId: number,
  ) => {
    const updatedGroups = [...groups];
    const sourceGroup = updatedGroups.find((g) => g.id === sourceGroupId);
    invariant(sourceGroup, "Source group not found");

    const participant = sourceGroup.participants.find(
      (p) => p.id === participantId,
    );
    invariant(participant, "Participant not found");

    sourceGroup.participants = sourceGroup.participants.filter(
      (p) => p.id !== participantId,
    );
    onChangeGroups(updatedGroups);
    onChangeUnassignedParticipants([...unassignedParticipants, participant]);
  };

  const moveUnassignedParticipantToGroup = (
    participantId: number,
    destinationGroupId: number,
  ) => {
    const updatedGroups = [...groups];
    const destinationGroup = updatedGroups.find(
      (g) => g.id === destinationGroupId,
    );
    invariant(destinationGroup, "Destination group not found");

    const participant = unassignedParticipants.find(
      (p) => p.id === participantId,
    );
    invariant(participant, "Participant not found");
    destinationGroup.participants.push(participant);

    onChangeUnassignedParticipants(
      unassignedParticipants.filter((p) => p.id !== participantId),
    );
    onChangeGroups(updatedGroups);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over != null && active.id !== over?.id) {
      const participantId = active.id as number;
      const sourceGroupId = participantsGroupMap[participantId] as
        | number
        | undefined;
      const destinationGroupId = over.id;

      // if sourceGroupId is null -> source group is unassigned
      if (sourceGroupId == null) {
        moveUnassignedParticipantToGroup(
          participantId,
          destinationGroupId as number,
        );
      } else if (destinationGroupId === UNASSIGNED_CONTAINER_ID) {
        moveParticipantToUnassigned(participantId, sourceGroupId);
      } else {
        moveParticipantToNewGroup(
          participantId,
          sourceGroupId,
          destinationGroupId as number,
        );
      }
    }
    setOverContainerId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverContainerId(event.over?.id ?? null);
  };

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
            {groups.map((group) => {
              if (group.isDeleted) return null;

              return (
                <GroupContainer
                  key={`${group.id}+${group.participants.length}`}
                  group={group}
                  onChangeGroupName={handleChangeGroupName}
                  onChangeGroupMatchDay={handleChangeGroupMatchDay}
                  onDeleteGroup={onDeleteGroup}
                  matchEnteringHelpers={matchEnteringHelpers}
                  helperAssignedCounts={helperAssignedCounts}
                  onAddHelperToGroup={onAddHelperToGroup}
                  onRemoveHelperFromGroup={onRemoveHelperFromGroup}
                  isOver={overContainerId === group.id}
                />
              );
            })}
            <div>
              <UnassignedContainer
                participants={unassignedParticipants}
                onDistributeParticipants={onDistributeParticipants}
                isOver={overContainerId === UNASSIGNED_CONTAINER_ID}
              />
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}

export function GroupContainer({
  group,
  onChangeGroupName,
  onChangeGroupMatchDay,
  onDeleteGroup,
  matchEnteringHelpers,
  helperAssignedCounts,
  onAddHelperToGroup,
  onRemoveHelperFromGroup,
  isOver,
}: {
  group: GridGroup;
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  helperAssignedCounts: Record<number, number>;
  onChangeGroupName: (groupId: number, newName: string) => void;
  onChangeGroupMatchDay: (groupId: number, matchDay: DayOfWeek | null) => void;
  onDeleteGroup: (groupId: number) => void;
  onAddHelperToGroup: (groupId: number, helperId: number) => void;
  onRemoveHelperFromGroup: (groupId: number, helperId: number) => void;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: group.id,
    data: {
      type: GROUP_CONTAINER_TYPE,
      group,
    },
  });

  const participants = useMemo(() => {
    return sortParticipantsByDwz(group.participants);
  }, [group.participants]);

  return (
    <Card
      className={cn(
        "h-full flex flex-col ",
        isOver ? "ring-2 ring-primary" : "",
      )}
    >
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
        className="p-0 pl-4 pb-4 pr-4 md:p-0 md:pl-6 md:pb-6 md:pr-6 flex flex-col h-full"
      >
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="px-2">
            <GroupMatchDay
              group={group}
              onChangeGroupMatchDay={onChangeGroupMatchDay}
            />
          </div>

          {/* Match Entering Helper Selector */}
          <div className="px-2">
            <GroupMatchEnteringHelperSelector
              matchEnteringHelpers={matchEnteringHelpers}
              assignedHelpers={group.matchEnteringHelpers ?? []}
              helperAssignedCounts={helperAssignedCounts}
              onAddHelper={(helperId) => onAddHelperToGroup(group.id, helperId)}
              onRemoveHelper={(helperId) =>
                onRemoveHelperFromGroup(group.id, helperId)
              }
            />
          </div>

          <div className="flex-1 flex flex-col">
            {participants.map((p) => (
              <ParticipantItem key={p.id} participant={p} />
            ))}
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
  onDistributeParticipants,
  isOver,
}: {
  participants: ParticipantWithName[];
  onDistributeParticipants: (participantsPerGroup: number) => void;
  isOver: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { setNodeRef } = useDroppable({
    id: UNASSIGNED_CONTAINER_ID,
    data: {
      type: UNASSIGNED_CONTAINER_TYPE,
    },
  });

  const sortedParticipants = useMemo(() => {
    return sortParticipantsByDwz(participants);
  }, [participants]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      participantsPerGroup: HTMLInputElement;
    };
    const participantsPerGroup = Number(
      formElements.participantsPerGroup.value,
    );
    onDistributeParticipants(participantsPerGroup);
    setIsOpen(false);
  };

  return (
    <Card
      className={cn(
        "h-full flex flex-col ",
        isOver ? "ring-2 ring-primary" : "",
      )}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center">
            <span className="flex-1">Nicht zugewiesene Teilnehmer</span>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-0">
                  <FastForward />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-2">
                  <Input
                    id="participantsPerGroup"
                    type="number"
                    placeholder="Teilnehmer pro Gruppe"
                  />
                  <Button type="submit">Verteilen</Button>
                </form>
              </PopoverContent>
            </Popover>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef}>
        {sortedParticipants.map((p) => (
          <ParticipantItem key={p.id} participant={p} />
        ))}
      </CardContent>
    </Card>
  );
}

export function ParticipantItem({
  participant,
}: {
  participant: ParticipantWithName;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: participant.id,
      data: {
        type: PARTICIPANT_CONTAINER_TYPE,
        participant,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const draggingClasses = isDragging ? "opacity-30" : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-2 py-1 rounded-md shadow-sm cursor-grab active:cursor-grabbing ${draggingClasses}`}
    >
      <ParticipantEntry participant={participant} />
    </div>
  );
}
