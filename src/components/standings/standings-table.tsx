"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { buildGameViewUrl } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import type { GroupSummary } from "@/db/types/group";
import type { PlayerStanding } from "@/db/types/standings";

type Props = {
  standings: PlayerStanding[];
  selectedGroup?: GroupSummary;
  selectedGroupId: string;
  selectedTournamentId: string;
  selectedRound?: string;
};

export function StandingsTable({
  standings,
  selectedGroup,
  selectedGroupId,
  selectedTournamentId,
  selectedRound,
}: Props) {
  const router = useRouter();

  const handlePlayerClick = (participantId: number) => {
    const url = buildGameViewUrl({
      tournamentId: Number(selectedTournamentId),
      groupId: Number(selectedGroupId),
      participantId,
    });
    router.push(url);
  };

  return (
    <CardContent>
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
            {standings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Keine Ergebnisse für Gruppe{" "}
                  {selectedGroup?.groupName || selectedGroupId}
                  {selectedRound && ` bis Runde ${selectedRound}`} gefunden.
                  <br />
                  <span className="text-sm text-muted-foreground">
                    Möglicherweise wurden noch keine Spiele eingegeben oder
                    beendet.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              standings.map((player, index) => (
                <TableRow
                  key={player.participant.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handlePlayerClick(player.participant.id)}
                >
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
                    {player.participant.title
                      ? `${player.participant.title} `
                      : ""}
                    {player.participant.profile.firstName}{" "}
                    {player.participant.profile.lastName}
                  </TableCell>
                  <TableCell className="text-right">
                    {player.participant.dwzRating || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {player.participant.fideRating || "-"}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
