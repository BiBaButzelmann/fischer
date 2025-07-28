import {
  getParticipantsInGroup,
  getCompletedGames,
} from "@/db/repositories/game";
import { calculateStandings } from "@/lib/standings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "@/lib/utils";
import type { GroupSummary } from "@/db/types/group";

interface RoundResultsDisplayProps {
  groupId: string;
  round?: string;
  groups: GroupSummary[];
}

export async function RoundResultsDisplay({
  groupId,
  round,
  groups,
}: RoundResultsDisplayProps) {
  const participants = await getParticipantsInGroup(Number(groupId));
  const games = await getCompletedGames(
    Number(groupId),
    round ? Number(round) : undefined,
  );
  const standings = calculateStandings(games, participants);

  const selectedGroup = groups.find((g) => g.id.toString() === groupId);

  return (
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
                {selectedGroup?.groupName || groupId}
                {round && ` bis Runde ${round}`} gefunden.
                <br />
                <span className="text-sm text-muted-foreground">
                  Möglicherweise wurden noch keine Spiele eingegeben oder
                  beendet.
                </span>
              </TableCell>
            </TableRow>
          ) : (
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
  );
}
