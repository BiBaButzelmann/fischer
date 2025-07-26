"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { getStandingsAction } from "@/actions/standings";
import type { PlayerStanding } from "@/lib/standings";
import type { TournamentSummary } from "@/db/types/tournament";
import type { GroupSummary } from "@/db/types/group";

export type Props = {
  selectedTournamentId: string;
  tournamentNames: TournamentSummary[];
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

  const [standings, setStandings] = useState<PlayerStanding[]>([]);
  const [loading, setLoading] = useState({ standings: false });

  const fetchStandings = async (groupId: string, round?: string) => {
    setLoading({ standings: true });
    try {
      const result = await getStandingsAction(
        Number(groupId),
        round ? Number(round) : undefined,
      );
      if (result.success) {
        setStandings(result.standings);
      } else {
        console.error("Failed to fetch standings:", result.error);
        setStandings([]);
      }
    } catch (error) {
      console.error("Error fetching standings:", error);
      setStandings([]);
    } finally {
      setLoading({ standings: false });
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      fetchStandings(selectedGroupId, selectedRound);
    }
  }, [selectedGroupId, selectedRound]);

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

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">DWZ</TableHead>
              <TableHead className="text-right">ELO</TableHead>
              <TableHead className="text-right">Punkte</TableHead>
              <TableHead className="text-right">Feinwertung</TableHead>
              <TableHead className="text-right">Anzahl Partien</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.standings
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-center">
                      <Skeleton className="h-5 w-5 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-3/4" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-10 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-10 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-12 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-12 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : standings.map((player, index) => (
                  <TableRow key={player.participantId}>
                    <TableCell className="py-2">
                      <div
                        className={cn(
                          "w-7 h-7 flex items-center justify-center rounded-md mx-auto font-bold",
                          index + 1 === 1 && "bg-yellow-400 text-yellow-900",
                          index + 1 === 2 && "bg-slate-300 text-slate-800",
                          index + 1 === 3 && "bg-orange-400 text-orange-900",
                        )}
                      >
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      {player.title ? `${player.title} ` : ""}
                      {player.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.dwz || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.elo || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.points.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.sonnebornBerger.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.gamesPlayed}
                    </TableCell>
                  </TableRow>
                ))}
            {!loading.standings && standings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  {selectedGroupId ? (
                    <>
                      Keine Ergebnisse für Gruppe{" "}
                      {groups.find((g) => g.id.toString() === selectedGroupId)
                        ?.groupName || selectedGroupId}
                      {selectedRound && ` bis Runde ${selectedRound}`} gefunden.
                      <br />
                      <span className="text-sm text-muted-foreground">
                        Möglicherweise wurden noch keine Spiele eingegeben oder
                        beendet.
                      </span>
                    </>
                  ) : (
                    "Bitte wähle eine Gruppe, um die Ergebnisse anzuzeigen."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
