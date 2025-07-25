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
import { useMemo } from "react";
import { matchDays } from "@/constants/constants";

type Props = {
  group: GridGroup;
  onChangeGroupMatchDay: (groupId: number, matchDay: DayOfWeek | null) => void;
};

export function GroupMatchDay({ group, onChangeGroupMatchDay }: Props) {
  const handleMatchdayChange = (value: DayOfWeek | "none") => {
    const matchDay = value === "none" ? null : (value as DayOfWeek);
    onChangeGroupMatchDay(group.id, matchDay);
  };

  const defaultValue = useMemo(
    () => group.matchDay || "none",
    [group.matchDay],
  );

  return (
    <Select defaultValue={defaultValue} onValueChange={handleMatchdayChange}>
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
