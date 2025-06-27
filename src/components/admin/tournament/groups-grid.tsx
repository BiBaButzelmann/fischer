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
import {
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
  useTransition,
} from "react";
import invariant from "tiny-invariant";
import { ParticipantEntry } from "./participant-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateGroups, updateGroups } from "./actions/groups";
import { Button } from "@/components/ui/button";
import { GridGroup } from "./types";
import { GroupMatchDay } from "./group-match-day";

export const UNASSIGNED_CONTAINER_ID = "unassigned-droppable";

export function GroupsGrid({
  groups: initialGroups,
  unassignedParticipants: initialUnassignedParticipants,
}: {
  groups: GridGroup[];
  unassignedParticipants: ParticipantWithName[];
}) {
  const [isPending, startTransition] = useTransition();

  const [groups, setGroups] = useState(initialGroups);
  const [unassignedParticipants, setUnassignedParticipants] = useState(
    initialUnassignedParticipants,
  );
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
    setGroups,
    setUnassignedParticipants,
    setActiveItem,
  });

  const handleSave = () => {
    startTransition(async () => {
      // TODO: tournament ID should be dynamic
      await updateGroups(1, groups, unassignedParticipants);
    });
  };

  const handleGenerateGroups = () => {
    startTransition(async () => {
      // TODO: tournament ID should be dynamic
      await generateGroups(1);
    });
  };

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-4">
        <span>Keine Gruppen vorhanden</span>
        <Button onClick={handleGenerateGroups} disabled={isPending}>
          Gruppen generieren
        </Button>
      </div>
    );
  }

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
              <GroupContainer key={group.id} group={group} />
            ))}
          </div>
        </div>
        <UnassignedContainer participants={unassignedParticipants} />
        <DragOverlay>
          {activeItem ? (
            <ParticipantItem participant={activeItem} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
      <Button onClick={handleSave} disabled={isPending}>
        Gruppenaufteilung Speichern
      </Button>
    </div>
  );
}

export function GroupContainer({ group }: { group: GridGroup }) {
  const { setNodeRef } = useDroppable({
    id: group.id,
    data: {
      type: "group",
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
          Gruppe {group.groupNumber} -- {group.participants.length} Teilnehmer
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef}>
        <div className="px-2 mb-2">
          <GroupMatchDay group={group} />
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
      type: "unassigned",
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
      type: "Participant",
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
  setGroups,
  setUnassignedParticipants,
  setActiveItem,
}: {
  groups: GridGroup[];
  unassignedParticipants: ParticipantWithName[];
  setGroups: Dispatch<SetStateAction<GridGroup[]>>;
  setUnassignedParticipants: Dispatch<SetStateAction<ParticipantWithName[]>>;
  setActiveItem: Dispatch<SetStateAction<ParticipantWithName | null>>;
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
    setActiveItem(active.data.current?.participant as ParticipantWithName);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const originalContainerId = findContainerId(active.id as number);
    const overContainerId =
      over.data.current?.type === "Group"
        ? over.id
        : over.data.current?.type === "UnassignedGroup"
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
    setGroups((prevGroups) => {
      const newGroups = [...prevGroups];
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

      setUnassignedParticipants(newUnassigned);
      return newGroups;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const originalContainerId = findContainerId(active.id as number);
    const overContainerId =
      over.data.current?.type === "Group"
        ? over.id
        : over.data.current?.type === "UnassignedGroup"
          ? UNASSIGNED_CONTAINER_ID
          : findContainerId(over.id as number);

    if (
      !originalContainerId ||
      !overContainerId ||
      originalContainerId === overContainerId
    ) {
      // This handles re-ordering within the same list
      if (originalContainerId === UNASSIGNED_CONTAINER_ID) {
        setUnassignedParticipants((prev) => {
          const oldIndex = prev.findIndex((p) => p.id === active.id);
          const newIndex = prev.findIndex((p) => p.id === over.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
      } else {
        setGroups((prev) => {
          const groupIndex = prev.findIndex(
            (g) => g.id === originalContainerId,
          );
          const group = prev[groupIndex];
          const oldIndex = group.participants.findIndex(
            (p) => p.id === active.id,
          );
          const newIndex = group.participants.findIndex(
            (p) => p.id === over.id,
          );
          const newParticipants = arrayMove(
            group.participants,
            oldIndex,
            newIndex,
          );
          const newGroups = [...prev];
          newGroups[groupIndex] = { ...group, participants: newParticipants };
          return newGroups;
        });
      }
      return;
    }
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
