"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { monthLabels } from "@/constants/constants";
import { GroupSummary } from "@/db/types/group";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type Props = {
  groups: GroupSummary[];
  selectedGroupId: string | undefined;
  selectedMonth: string | undefined;
};

export function GenerateFideReportSelector({
  groups,
  selectedGroupId,
  selectedMonth,
}: Props) {
  const router = useRouter();
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const buildUrl = (params: { groupId?: string; month?: string }) => {
    const searchParams = new URLSearchParams();

    if (params.groupId) {
      searchParams.set("groupId", params.groupId);
    }

    if (params.month) {
      searchParams.set("month", params.month);
    }

    return `/admin/fide-bericht?${searchParams.toString()}`;
  };

  const handleGroupChange = (groupId: string) => {
    router.push(
      buildUrl({
        groupId,
        month: selectedMonth,
      }),
    );
  };

  const handleMonthChange = (month: string) => {
    router.push(
      buildUrl({
        groupId: selectedGroupId,
        month,
      }),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Label htmlFor="gruppe">Gruppe</Label>
        <Select value={selectedGroupId} onValueChange={handleGroupChange}>
          <SelectTrigger id="gruppe">
            <SelectValue placeholder="Gruppe auswählen" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.groupName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="monat">Monat</Label>
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger id="monat">
            <SelectValue placeholder="Monat auswählen" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.toString()} value={month.toString()}>
                {monthLabels[month - 1]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
