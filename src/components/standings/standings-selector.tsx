"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import type { GroupSummary } from "@/db/types/group";
import { buildResultsViewUrl } from "@/lib/navigation";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";

export type Props = {
  selectedGroupId?: string;
  groups: GroupSummary[];
  selectedRound?: string;
  rounds: number[];
};

export function StandingsSelector({
  groups,
  rounds,
  selectedGroupId,
  selectedRound,
}: Props) {
  const router = useRouter();
  const slug = useTournamentSlug();

  const handleGroupChange = (groupId: string) => {
    router.push(
      buildResultsViewUrl({
        slug,
        groupId,
        round: selectedRound,
      }),
    );
  };

  const handleRoundChange = (round: string | undefined) => {
    router.push(
      buildResultsViewUrl({
        slug,
        groupId: selectedGroupId,
        round,
      }),
    );
  };
  return (
    <div className="flex flex-nowrap gap-2 md:gap-4 mb-4">
      <div className="flex max-w-48 flex-1 flex-col gap-1">
        <Label htmlFor="group-select" className="text-sm font-medium">
          Gruppe
        </Label>
        <Select value={selectedGroupId || ""} onValueChange={handleGroupChange}>
          <SelectTrigger id="group-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>
                {g.groupName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden md:flex max-w-48 flex-1 flex-col gap-1">
        <Label htmlFor="round-select" className="text-sm font-medium">
          Stand nach
        </Label>
        <Select
          key={selectedRound}
          value={selectedRound || ""}
          onValueChange={handleRoundChange}
        >
          <SelectTrigger
            id="round-select"
            className="w-full"
            clearable={!!selectedRound}
            onClear={() => handleRoundChange(undefined)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rounds.map((r) => (
              <SelectItem key={r} value={r.toString()}>
                Runde {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
