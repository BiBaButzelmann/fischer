"use client";

import { useState, useEffect } from "react";
import type { Tournament } from "@/db/types/tournament";
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

export function Results({
  initialTournament,
  tournamentNames,
  groups,
  rounds,
}: {
  initialTournament: Tournament;
  tournamentNames: {
    id: number;
    name: string;
    numberOfRounds: number;
  }[];
  groups: {
    id: number;
    groupName: string;
  }[];
  rounds: number[];
}) {
  // State for selectors
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    tournamentNames[0]?.id.toString() || "",
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groups.length > 0 ? groups[0].id.toString() : "",
  );
  const [selectedRound, setSelectedRound] = useState<string | undefined>(
    rounds.length > 0 ? rounds[rounds.length - 1].toString() : undefined,
  );

  // State for standings data
  const [standings, setStandings] = useState<PlayerStanding[]>([]);
  const [loading, setLoading] = useState({ standings: false });

  // Function to fetch standings
  const fetchStandings = async (groupId: string, round?: string) => {
    if (!groupId || groupId === "") {
      return;
    }

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

  // Effect to fetch standings when selections change
  useEffect(() => {
    if (selectedGroupId && selectedGroupId !== "") {
      fetchStandings(selectedGroupId, selectedRound);
    }
  }, [selectedGroupId, selectedRound]);

  // Effect to update state when props change (groups change due to tournament selection)
  useEffect(() => {
    if (
      groups.length > 0 &&
      (selectedGroupId === "" ||
        !groups.find((g) => g.id.toString() === selectedGroupId))
    ) {
      setSelectedGroupId(groups[0].id.toString());
    }
  }, [groups, selectedGroupId]);

  // Effect to update rounds when tournament changes
  useEffect(() => {
    if (rounds.length > 0) {
      setSelectedRound(rounds[rounds.length - 1].toString()); // Default to last round
    }
  }, [rounds]);

  // Handler functions similar to partien-selector
  const handleTournamentChange = (tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    // Note: In a full implementation, you'd fetch new groups and rounds here
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleRoundChange = (round: string | undefined) => {
    setSelectedRound(round);
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
            <SelectTrigger id="tournament-select" className="w-32">
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
          <Select value={selectedGroupId} onValueChange={handleGroupChange}>
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
            value={selectedRound}
            onValueChange={handleRoundChange}
          >
            <SelectTrigger id="round-select" className="w-48">
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
              <TableHead className="text-right">Spielquote</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.standings ? (
              Array.from({ length: 8 }).map((_, i) => (
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
                </TableRow>
              ))
            ) : standings.length > 0 ? (
              standings.map((player, index) => (
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
                    {player.gamesPlayed > 0
                      ? ((player.points / player.gamesPlayed) * 100).toFixed(
                          1,
                        ) + "%"
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  {selectedGroupId && selectedRound ? (
                    loading.standings ? (
                      "Lade Ergebnisse..."
                    ) : (
                      <>
                        Keine Ergebnisse für Gruppe{" "}
                        {groups.find((g) => g.id.toString() === selectedGroupId)
                          ?.groupName || selectedGroupId}
                        {selectedRound && ` bis Runde ${selectedRound}`}{" "}
                        gefunden.
                        <br />
                        <span className="text-sm text-muted-foreground">
                          Möglicherweise wurden noch keine Spiele eingegeben
                          oder beendet.
                        </span>
                      </>
                    )
                  ) : (
                    "Bitte wählen Sie eine Gruppe und Runde, um die Ergebnisse anzuzeigen."
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
