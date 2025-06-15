"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GridGroup } from "./types";
import { MatchDay } from "@/db/types/group";
import { useMemo, useTransition } from "react";
import { updateGroupMatchDay } from "./actions/groups";

const matchDays: Record<MatchDay, string> = {
  tuesday: "Dienstag",
  thursday: "Donnerstag",
  friday: "Freitag",
};

export function GroupMatchDay({ group }: { group: GridGroup }) {
  const [isPending, startTransition] = useTransition();

  const handleMatchdayChange = (value: MatchDay | "none") => {
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
