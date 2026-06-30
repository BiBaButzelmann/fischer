"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "@/lib/utils";
import { buildGameViewUrl, tournamentPath } from "@/lib/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";
import type {
  CrossTable as CrossTableData,
  CrossTableResult,
} from "@/services/standings";

type Props = {
  crossTable: CrossTableData;
  selectedGroupId: string;
};

function participantName(
  participant: CrossTableData["participants"][number],
): string {
  const { title, firstName, lastName } = participant;
  return `${title ? `${title} ` : ""}${firstName} ${lastName}`;
}

function CellContent({ entries }: { entries: CrossTableResult[] }) {
  if (entries.length === 0) {
    return <span className="text-muted-foreground/50">·</span>;
  }

  const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
  const colorClass =
    totalPoints >= entries.length
      ? "text-emerald-600"
      : totalPoints === 0
        ? "text-red-500"
        : "text-amber-600";

  return (
    <span className={cn("font-semibold tabular-nums", colorClass)}>
      {entries.map((e) => e.display).join(" ")}
    </span>
  );
}

export function CrossTable({ crossTable, selectedGroupId }: Props) {
  const router = useRouter();
  const slug = useTournamentSlug();
  const { participants, rows } = crossTable;

  if (participants.length === 0) {
    return (
      <div className="p-8 text-center">
        Keine Ergebnisse gefunden.
        <br />
        <span className="text-sm text-muted-foreground">
          Die Gruppen sind noch nicht ausgelost.
        </span>
      </div>
    );
  }

  const handlePlayerClick = (participantId: number) => {
    router.push(
      buildGameViewUrl({
        slug,
        groupId: Number(selectedGroupId),
        participantId,
      }),
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">#</TableHead>
            <TableHead className="min-w-[160px]">Name</TableHead>
            {participants.map((_, index) => (
              <TableHead
                key={index}
                title={participantName(participants[index])}
                className="w-9 text-center border-l"
              >
                {index + 1}
              </TableHead>
            ))}
            <TableHead className="text-right border-l">Punkte</TableHead>
            <TableHead className="hidden md:table-cell text-right">
              Feinwertung
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isDeleted = row.participant.deletedAt != null;
            return (
              <TableRow
                key={row.participant.id}
                className={cn(isDeleted && "opacity-50")}
              >
                <TableCell className="text-center">
                  <div
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded-md mx-auto font-bold",
                      row.position === 1 && "bg-yellow-400 text-yellow-900",
                      row.position === 2 && "bg-slate-300 text-slate-800",
                      row.position === 3 && "bg-orange-400 text-orange-900",
                    )}
                  >
                    {row.position}
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    "whitespace-nowrap",
                    !isDeleted && "cursor-pointer",
                  )}
                  onClick={
                    isDeleted
                      ? undefined
                      : () => handlePlayerClick(row.participant.id)
                  }
                >
                  {participantName(row.participant)}
                </TableCell>
                {row.cells.map((entries, colIndex) => {
                  if (entries === null) {
                    return (
                      <TableCell
                        key={colIndex}
                        className="border-l bg-muted/70"
                      />
                    );
                  }
                  const playable = entries.find((e) => e.played);
                  if (playable) {
                    return (
                      <TableCell
                        key={colIndex}
                        className="border-l p-0 text-center"
                      >
                        <Link
                          href={tournamentPath(
                            slug,
                            `/partien/${playable.gameId}`,
                          )}
                          className="flex h-full w-full items-center justify-center px-2 py-2 transition-colors hover:bg-muted/50"
                        >
                          <CellContent entries={entries} />
                        </Link>
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={colIndex} className="border-l text-center">
                      <CellContent entries={entries} />
                    </TableCell>
                  );
                })}
                <TableCell className="text-right font-semibold tabular-nums border-l">
                  {row.points.toFixed(1)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                  {row.sonnebornBerger.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
