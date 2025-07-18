"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GridGroup } from "./types";
import { DayOfWeek } from "@/db/types/group";
import { useMemo, useTransition } from "react";
import { updateGroupMatchDay } from "@/actions/group";
import { matchDays } from "@/constants/constants";

export function GroupMatchDay({ group }: { group: GridGroup }) {
  const [isPending, startTransition] = useTransition();

  const handleMatchdayChange = (value: DayOfWeek | "none") => {
    startTransition(async () => {
      await updateGroupMatchDay(group.id, value === "none" ? null : value);
    });
  };

  const defaultValue = useMemo(
    () => group.matchDay || "none",
    [group.matchDay],
  );

  return (
    <Select
      disabled={isPending}
      defaultValue={defaultValue}
      onValueChange={handleMatchdayChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Spieltag" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(matchDays).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
        <SelectItem value="none">Nicht ausgewählt</SelectItem>
      </SelectContent>
    </Select>
  );
}
