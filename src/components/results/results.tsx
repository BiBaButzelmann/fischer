"use client";

import { useRouter } from "next/navigation";
import { CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import type { TournamentNames } from "@/db/types/tournament";
import type { GroupSummary } from "@/db/types/group";

export type Props = {
  selectedTournamentId: string;
  tournamentNames: TournamentNames[];
  selectedGroupId?: string;
  groups: GroupSummary[];
  selectedRound?: string;
  rounds: number[];
};

export function Results({
  tournamentNames,
  groups,
  rounds,
  selectedTournamentId,
  selectedGroupId,
  selectedRound,
}: Props) {
  const router = useRouter();

  const buildUrl = (params: {
    tournamentId: string;
    groupId?: string;
    round?: string;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.set("tournamentId", params.tournamentId);

    if (params.groupId) {
      searchParams.set("groupId", params.groupId);
    }

    if (params.round) {
      searchParams.set("round", params.round);
    }

    return `/ergebnisse?${searchParams.toString()}`;
  };

  const handleTournamentChange = (tournamentId: string) => {
    router.push(
      buildUrl({
        tournamentId,
        groupId: selectedGroupId,
        round: selectedRound,
      }),
    );
  };

  const handleGroupChange = (groupId: string) => {
    router.push(
      buildUrl({
        tournamentId: selectedTournamentId,
        groupId,
        round: selectedRound,
      }),
    );
  };

  const handleRoundChange = (round: string | undefined) => {
    router.push(
      buildUrl({
        tournamentId: selectedTournamentId,
        groupId: selectedGroupId,
        round,
      }),
    );
  };
  return (
    <CardContent>
      <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="tournament-select" className="text-sm font-medium">
            Ausgabe
          </Label>
          <Select
            value={selectedTournamentId}
            onValueChange={handleTournamentChange}
          >
            <SelectTrigger id="tournament-select" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tournamentNames.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="group-select" className="text-sm font-medium">
            Gruppe
          </Label>
          <Select
            value={selectedGroupId || ""}
            onValueChange={handleGroupChange}
          >
            <SelectTrigger id="group-select" className="w-48">
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
        <div className="flex flex-col gap-1">
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
              className="w-48"
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
    </CardContent>
  );
}
