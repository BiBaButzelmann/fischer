"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableMatchDays } from "@/db/schema/columns.helpers";
import { updateRefereeIdByTournamentIdAndDayofWeek } from "@/actions/match-day";
import { RefereeWithName } from "@/db/types/referee";
import type { MatchDay } from "@/db/types/group";

type Props = {
  tournamentId: number;
  referees: RefereeWithName[];
  currentAssignments: Partial<Record<MatchDay, number | null>>;
};

const dayLabels: Record<MatchDay, string> = {
  tuesday: "Dienstag",
  thursday: "Donnerstag",
  friday: "Freitag",
};

export function RefereeAssignmentForm({
  tournamentId,
  referees,
  currentAssignments,
}: Props) {
  const [assignments, setAssignments] =
    useState<Partial<Record<MatchDay, number | null>>>(currentAssignments);
  const [isPending, startTransition] = useTransition();

  const handleAssignmentChange = (day: MatchDay, refereeId: string | null) => {
    setAssignments((prev) => ({
      ...prev,
      [day]:
        refereeId === "none" ? null : refereeId ? parseInt(refereeId) : null,
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const promises = availableMatchDays.map((day) => {
        const refereeId = assignments[day] ?? null;
        return updateRefereeIdByTournamentIdAndDayofWeek(
          day,
          tournamentId,
          refereeId,
        );
      });

      await Promise.all(promises);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableMatchDays.map((day) => (
          <div key={day} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {dayLabels[day]}
            </label>
            <Select
              value={assignments[day]?.toString() || "none"}
              onValueChange={(value) => handleAssignmentChange(day, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Schiedsrichter wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Schiedsrichter</SelectItem>
                {referees.map((referee) => (
                  <SelectItem key={referee.id} value={referee.id.toString()}>
                    {referee.profile.firstName} {referee.profile.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Speichern..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
}
