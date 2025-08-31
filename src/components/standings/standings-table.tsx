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
import type { PlayerStats } from "@/db/types/standings";
import { ParticipantWithName } from "@/db/types/participant";
import invariant from "tiny-invariant";

type Props = {
  standings: PlayerStats[];
  participants: ParticipantWithName[];
  selectedGroup?: GroupSummary;
  selectedGroupId: string;
  selectedTournamentId: string;
  selectedRound?: string;
};

export function StandingsTable({
  standings,
  participants,
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
              standings.map((playerStats, index) => {
                const participant = participants.find(
                  (p) => p.id === playerStats.participantId,
                );
                invariant(participant, "Participant not found");
                return (
                  <StandingsRow
                    key={participant.id}
                    participant={participant}
                    playerStats={playerStats}
                    position={index + 1}
                    handlePlayerClick={handlePlayerClick}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}

type StandingsRowProps = {
  participant: ParticipantWithName;
  playerStats: PlayerStats;
  position: number;
  handlePlayerClick: (participantId: number) => void;
};

function StandingsRow({
  participant,
  playerStats,
  position,
  handlePlayerClick,
}: StandingsRowProps) {
  const handleClick = () => {
    if (participant.deletedAt == null) {
      handlePlayerClick(participant.id);
    }
  };

  return (
    <TableRow
      key={participant.id}
      className={cn(
        "cursor-pointer hover:bg-muted/50 transition-colors",
        participant.deletedAt != null && "opacity-50 cursor-default",
      )}
      onClick={handleClick}
    >
      <TableCell className="py-2">
        <div
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md mx-auto font-bold",
            position === 1 && "bg-yellow-400 text-yellow-900",
            position === 2 && "bg-slate-300 text-slate-800",
            position === 3 && "bg-orange-400 text-orange-900",
          )}
        >
          {position}
        </div>
      </TableCell>
      <TableCell>
        {participant.title ? `${participant.title} ` : ""}
        {participant.profile.firstName} {participant.profile.lastName}
      </TableCell>
      <TableCell className="text-right">
        {participant.dwzRating || "-"}
      </TableCell>
      <TableCell className="text-right">
        {participant.fideRating || "-"}
      </TableCell>
      <TableCell className="text-right">
        {playerStats.points.toFixed(1)}
      </TableCell>
      <TableCell className="text-right">
        {playerStats.sonnebornBerger.toFixed(2)}
      </TableCell>
      <TableCell className="text-right">{playerStats.gamesPlayed}</TableCell>
    </TableRow>
  );
}
