"use client";

import { useState, useTransition } from "react";
import { GroupWithParticipants } from "@/db/types/group";
import { ParticipantWithName } from "@/db/types/participant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParticipantEntry } from "../groups/participant-entry";
import { updateGroupPositions } from "@/actions/group";
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { rescheduleGamesForGroup } from "@/actions/game";

type GroupPositionManagerProps = {
  tournamentId: number;
  groups: GroupWithParticipants[];
  onGroupChange: (groupId: number) => void;
};

export function GroupPositionManager({
  tournamentId,
  groups: initialGroups,
  onGroupChange,
}: GroupPositionManagerProps) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const sortedGroups = [...initialGroups].sort(
    (a, b) => a.groupNumber - b.groupNumber,
  );

  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    sortedGroups[0]?.id.toString() || "",
  );

  const [groupParticipants, setGroupParticipants] = useState<
    Record<number, ParticipantWithName[]>
  >(
    sortedGroups.reduce(
      (acc, group) => {
        acc[group.id] = [...group.participants];
        return acc;
      },
      {} as Record<number, ParticipantWithName[]>,
    ),
  );

  const [activeItem, setActiveItem] = useState<ParticipantWithName | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const selectedGroup = sortedGroups.find(
    (group) => group.id.toString() === selectedGroupId,
  );

  const currentParticipants = selectedGroup
    ? groupParticipants[selectedGroup.id] || []
    : [];

  const handleGroupChange = (value: string) => {
    setSelectedGroupId(value);
    onGroupChange(parseInt(value));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const participant = currentParticipants.find((p) => p.id === active.id);
    setActiveItem(participant || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over || !selectedGroup) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    const oldIndex = currentParticipants.findIndex((p) => p.id === activeId);
    const newIndex = currentParticipants.findIndex((p) => p.id === overId);

    if (oldIndex !== newIndex) {
      const newParticipants = arrayMove(
        currentParticipants,
        oldIndex,
        newIndex,
      );
      setGroupParticipants((prev) => ({
        ...prev,
        [selectedGroup.id]: newParticipants,
      }));
    }
  };

  const handleSave = () => {
    if (!selectedGroup) return;

    startTransition(async () => {
      await updateGroupPositions(
        tournamentId,
        selectedGroup.id,
        currentParticipants,
      );
      const response = await rescheduleGamesForGroup(
        tournamentId,
        selectedGroup.id,
      );
      setError(undefined);
      if (response?.error != null) {
        setError(response.error);
      }
    });
  };

  if (sortedGroups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Keine Gruppen gefunden. Erstelle zuerst Gruppen.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Drag and Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Selected Group Participants */}
        {selectedGroup && (
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Select
                  value={selectedGroupId}
                  onValueChange={handleGroupChange}
                >
                  <SelectTrigger className="w-96">
                    <SelectValue placeholder="Gruppe auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.groupName || `Gruppe ${group.groupNumber}`} -{" "}
                        {group.participants.length} Teilnehmer
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <SortableContext items={currentParticipants.map((p) => p.id)}>
                <div className="space-y-3">
                  {currentParticipants.map((participant) => (
                    <SortableParticipantItem
                      key={participant.id}
                      participant={participant}
                    />
                  ))}
                </div>
              </SortableContext>
            </CardContent>
          </Card>
        )}

        <DragOverlay>
          {activeItem ? (
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg min-w-96">
              <ParticipantEntry
                participant={activeItem}
                showMatchDays={false}
                showFideRating={false}
                showDwzRating={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {error ? (
        <p className="text-sm text-red-500 text-center">{error}</p>
      ) : null}

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isPending} className="w-full">
        Paarungen generieren
      </Button>
    </div>
  );
}

function SortableParticipantItem({
  participant,
}: {
  participant: ParticipantWithName;
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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-white cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <ParticipantEntry
          participant={participant}
          showMatchDays={false}
          showFideRating={false}
          showDwzRating={false}
        />
      </div>
    </div>
  );
}
