import { authWithRedirect } from "@/auth/utils";
import { PrintButton } from "@/components/partien/print/print-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getGamesByTournamentId } from "@/db/repositories/game";
import { getRolesByUserId } from "@/db/repositories/role";
import { getParticipantFullName } from "@/lib/participant";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    tournamentId: string;
    groupId?: string;
    round?: string;
    participantId?: string;
    matchdayId?: string;
  }>;
}) {
  const session = await authWithRedirect();
  const roles = await getRolesByUserId(session.user.id);

  if (!roles.includes("setupHelper") && session.user.role !== "admin") {
    redirect("/partien");
  }

  const { tournamentId, groupId, round, participantId, matchdayId } =
    await searchParams;

  const games = await getGamesByTournamentId(
    Number(tournamentId),
    groupId ? Number(groupId) : undefined,
    matchdayId ? Number(matchdayId) : undefined,
    round != null ? Number(round) : undefined,
    participantId != null ? Number(participantId) : undefined,
  );

  return (
    <div>
      <div className="print:hidden">
        <PrintButton />
      </div>
      <div className="w-[210mm]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center">
                Gruppe
              </TableHead>
              <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center">
                Brett
              </TableHead>
              <TableHead className="sticky top-0 bg-card">Weiß</TableHead>
              <TableHead className="sticky top-0 bg-card">Schwarz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow
                key={game.id}
                className="cursor-default even:bg-gray-100"
              >
                <TableCell className="w-16 text-center">
                  <Badge variant="secondary">{game.group.groupName}</Badge>
                </TableCell>
                <TableCell className="w-16 text-center">
                  <Badge variant="outline">{game.boardNumber}</Badge>
                </TableCell>
                <TableCell className="w-40 truncate">
                  {getParticipantFullName(game.whiteParticipant!)}
                </TableCell>
                <TableCell className="w-40 truncate">
                  {getParticipantFullName(game.blackParticipant!)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
