import { GameWithParticipants } from "@/db/types/game";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getParticipantFullName } from "@/lib/participant";
import { getDatetimeString } from "@/lib/date";

export function MyGamesList({ games }: { games: GameWithParticipants[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Runde</TableHead>
          <TableHead>Brett</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {games.map((game) => (
          <TableRow key={game.id}>
            <TableCell>{getDatetimeString(game.scheduled)}</TableCell>
            <TableCell>{game.round}</TableCell>
            <TableCell>{game.boardNumber}</TableCell>
            <TableCell>
              {getParticipantFullName(game.whiteParticipant)} vs.{" "}
              {getParticipantFullName(game.blackParticipant)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
