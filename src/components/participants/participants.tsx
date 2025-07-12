import { ParticipantWithName } from "@/db/types/participant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "@/lib/utils";

type Props = {
  profileId?: number;
  participants: ParticipantWithName[];
};

export function Participants({ profileId, participants }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px] sticky top-0 bg-card">#</TableHead>
          <TableHead className="sticky top-0 bg-card">Name</TableHead>
          <TableHead className="text-right sticky top-0 bg-card">ELO</TableHead>
          <TableHead className="text-right sticky top-0 bg-card">DWZ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((p, index) => (
          <TableRow
            key={p.id}
            className={cn(
              "hover:bg-muted",
              profileId === p.profileId ? "bg-secondary" : "",
            )}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium truncate">
              {p.title ? `${p.title} ` : ""}
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
