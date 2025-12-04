"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupSummary } from "@/db/types/group";
import { useRouter } from "next/navigation";

type Props = {
  groups: GroupSummary[];
  selectedGroupId: string | undefined;
};

export function GenerateDwzReportSelector({
  groups,
  selectedGroupId,
}: Props) {
  const router = useRouter();

  const buildUrl = (params: { groupId?: string }) => {
    const searchParams = new URLSearchParams();

    if (params.groupId) {
      searchParams.set("groupId", params.groupId);
    }

    return `/admin/dwz-bericht?${searchParams.toString()}`;
  };

  const handleGroupChange = (groupId: string) => {
    router.push(buildUrl({ groupId }));
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
    </div>
  );
}