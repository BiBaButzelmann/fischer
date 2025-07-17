"use client";

import { updateSetupHelpers } from "@/actions/match-day";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { matchDays, matchDaysShort } from "@/constants/constants";
import { availableMatchDays } from "@/db/schema/columns.helpers";
import { DayOfWeek } from "@/db/types/group";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import { useState, useTransition } from "react";
import invariant from "tiny-invariant";
import { Badge } from "@/components/ui/badge";
import { Trash } from "lucide-react";

type Props = {
  tournamentId: number;
  setupHelpers: SetupHelperWithName[];
  currentAssignments: Record<DayOfWeek, SetupHelperWithName[]>;
};

export function SetupHelperAssignmentForm({
  tournamentId,
  setupHelpers,
  currentAssignments,
}: Props) {
  const [assignments, setAssignments] =
    useState<Record<DayOfWeek, SetupHelperWithName[]>>(currentAssignments);
  const [isPending, startTransition] = useTransition();

  const handleValueChange = (day: DayOfWeek, setupHelperId: string) => {
    setAssignments((prev) => {
      const setupHelper = setupHelpers.find(
        (sh) => sh.id.toString() === setupHelperId,
      );
      invariant(setupHelper, "Setup helper not found");

      if (prev[day] == null) {
        prev[day] = [];
      }
      const currentlyAssigned = prev[day];
      const currentlyAssignedIds = new Set(
        currentlyAssigned.map((sh) => sh.id),
      );

      if (!currentlyAssignedIds.has(setupHelper.id)) {
        currentlyAssigned.push(setupHelper);
      }

      return {
        ...prev,
        [day]: Array.from(currentlyAssigned),
      };
    });
  };

  const handleDelete = (day: DayOfWeek, setupHelperId: number) => {
    setAssignments((prev) => {
      const currentlyAssigned =
        prev[day]?.filter((sh) => sh.id !== setupHelperId) ?? [];
      return {
        ...prev,
        [day]: currentlyAssigned,
      };
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const groupedSetupHelperIds = Object.fromEntries(
        Object.entries(assignments).map(([day, helpers]) => [
          day,
          helpers.map((sh) => sh.id.toString()),
        ]),
      ) as Record<DayOfWeek, string[]>;
      await updateSetupHelpers(tournamentId, groupedSetupHelperIds);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableMatchDays.map((day) => (
          <div key={day}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {matchDays[day]}
              </label>
              <Select
                value=""
                onValueChange={(value) => handleValueChange(day, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aufbauhelfer hinzufügen..." />
                </SelectTrigger>
                <SelectContent>
                  {setupHelpers.map((setupHelper) => (
                    <SelectItem
                      key={setupHelper.id}
                      value={setupHelper.id.toString()}
                      className="flex items-center justify-between"
                    >
                      {setupHelper.profile.firstName}{" "}
                      {setupHelper.profile.lastName}{" "}
                      <div className="flex gap-1">
                        <Badge>
                          {matchDaysShort[setupHelper.preferredMatchDay]}
                        </Badge>
                        {setupHelper.secondaryMatchDays.length > 0 &&
                          setupHelper.secondaryMatchDays.map((day) => (
                            <Badge key={day} variant="secondary">
                              {matchDaysShort[day]}
                            </Badge>
                          ))}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-2">
              {assignments[day] != null
                ? assignments[day].map((sh) => (
                    <div
                      key={sh.id}
                      className="px-2 py-2 bg-gray-100 rounded mb-1"
                    >
                      <SetupHelperEntry
                        setupHelper={sh}
                        onDelete={() => handleDelete(day, sh.id)}
                      />
                    </div>
                  ))
                : null}
            </div>
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

function UserWeekday({
  preferredMatchDay,
  secondaryMatchDays,
}: {
  preferredMatchDay: DayOfWeek;
  secondaryMatchDays: DayOfWeek[];
}) {
  return (
    <div className="flex gap-1">
      <Badge>{matchDaysShort[preferredMatchDay]}</Badge>
      {secondaryMatchDays.length > 0 &&
        secondaryMatchDays.map((day) => (
          <Badge key={day} variant="secondary">
            {matchDaysShort[day]}
          </Badge>
        ))}
    </div>
  );
}

function SetupHelperEntry({
  setupHelper,
  onDelete,
}: {
  setupHelper: SetupHelperWithName;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center">
      <span className="inline-flex flex-1">
        {setupHelper.profile.firstName} {setupHelper.profile.lastName}
      </span>
      <UserWeekday
        preferredMatchDay={setupHelper.preferredMatchDay}
        secondaryMatchDays={setupHelper.secondaryMatchDays}
      />
      <Button variant="outline" size="icon" className="ml-2" onClick={onDelete}>
        <Trash />
      </Button>
    </div>
  );
}
