import { ParticipantWithName } from "@/db/types/participant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Props = { participants: ParticipantWithName[] };

export async function Participants({ participants }: Props) {
  return (
    <Table>
      <TableHeader className="sticky top-0">
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">ELO</TableHead>
          <TableHead className="text-right">DWZ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((p, index) => (
          <TableRow key={p.id} className="hover:bg-muted">
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium truncate">
              {p.profile.firstName} {p.profile.lastName}
            </TableCell>
            <TableCell className="text-right">{p.fideRating}</TableCell>
            <TableCell className="text-right">{p.dwzRating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
