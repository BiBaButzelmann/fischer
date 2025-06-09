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
import { useMemo, useState, useTransition } from "react";
import invariant from "tiny-invariant";
import { ParticipantEntry } from "./participant-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateGroups, updateGroups } from "./actions";
import { Button } from "@/components/ui/button";
import { GridGroup } from "./types";

export function GroupsGrid({ groups: initialGroups }: { groups: GridGroup[] }) {
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState(initialGroups);
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

  const findContainer = (id: number) => {
    return groups.find((group) => group.participants.some((p) => p.id === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    invariant(active.data.current, "Active data must be set");
    setActiveItem(active.data.current?.participant as ParticipantWithName);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeContainer = findContainer(active.id as number);
    const overContainer = findContainer(over.id as number);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setGroups((prev) => {
      const activeItems = activeContainer.participants;
      const overItems = overContainer.participants;

      const activeIndex = activeItems.findIndex((p) => p.id === active.id);
      const overIndex = overItems.findIndex((p) => p.id === over.id);

      let newIndex;
      if (over.id in prev.map((g) => g.id)) {
        newIndex = overItems.length;
      } else {
        newIndex = overIndex >= 0 ? overIndex : overItems.length;
      }

      const newGroups = prev.map((group) => {
        if (group.id === activeContainer.id) {
          return {
            ...group,
            participants: group.participants.filter((p) => p.id !== active.id),
          };
        }
        if (group.id === overContainer.id) {
          const [movedItem] = activeContainer.participants.splice(
            activeIndex,
            1,
          );
          group.participants.splice(newIndex, 0, movedItem);
          return { ...group, participants: [...group.participants] };
        }
        return group;
      });

      return newGroups;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeContainer = findContainer(active.id as number);
    const overContainer = findContainer(over.id as number);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = activeContainer.participants.findIndex(
      (p) => p.id === active.id,
    );
    const overIndex = overContainer.participants.findIndex(
      (p) => p.id === over.id,
    );

    if (activeIndex !== overIndex) {
      setGroups((prev) => {
        return prev.map((group) => {
          if (group.id === activeContainer.id) {
            return {
              ...group,
              participants: arrayMove(
                group.participants,
                activeIndex,
                overIndex,
              ),
            };
          }
          return group;
        });
      });
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      // TODO: tournament ID should be dynamic
      await updateGroups(1, groups);
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
        <CardTitle>Gruppe {group.groupNumber}</CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef}>
        <SortableContext items={participantIds}>
          {group.participants.map((p) => (
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
