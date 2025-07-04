"use client";

import { GroupWithParticipants } from "@/db/types/group";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

export function PartienSelector({
  selectedYear,
  years,
  selectedGroup,
  groups,
}: {
  selectedYear: string;
  years: string[];
  selectedGroup: string;
  groups: GroupWithParticipants[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (year: string) => {
    router.push(`?year=${year}&group=${selectedGroup}`);
  };

  const handleGroupChange = (group: string) => {
    router.push(`?year=${selectedYear}&group=${group}`);
  };

  return (
    <div className="flex gap-4 mb-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="year-select" className="text-sm font-medium">
          Jahr
        </Label>
        <Select value={selectedYear} onValueChange={handleYearChange}>
          <SelectTrigger id="year-select" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="group-select" className="text-sm font-medium">
          Gruppe
        </Label>
        <Select value={selectedGroup} onValueChange={handleGroupChange}>
          <SelectTrigger id="group-select" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.groupNumber.toString()}>
                {g.groupName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
