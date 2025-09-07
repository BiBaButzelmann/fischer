"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toDateString, toLocalDateTime } from "@/lib/date";
import type { GamePostponementWithDetails } from "@/db/types/game-postponement";
import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { buildGameViewUrl } from "@/lib/navigation";
import invariant from "tiny-invariant";

type Props = {
  postponements: GamePostponementWithDetails[];
  isAdmin?: boolean;
  tournamentId: number;
};

export function PostponementGrid({
  postponements,
  isAdmin = false,
  tournamentId,
}: Props) {
  const router = useRouter();

  const handleNavigate = (gameUrl: string) => {
    router.push(gameUrl);
  };

  if (postponements.length === 0) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="py-16 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Keine Partienverlegungen
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Es wurden noch keine Partien im aktuellen Turnier verlegt."
              : "Du hast noch keine Partien verlegt."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center align-middle">
              Runde
            </TableHead>
            <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center align-middle">
              Gruppe
            </TableHead>
            <TableHead className="sticky top-0 bg-card align-middle">
              Weiß
            </TableHead>
            <TableHead className="sticky top-0 bg-card align-middle">
              Schwarz
            </TableHead>
            <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center align-middle">
              Von
            </TableHead>
            <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center align-middle">
              Nach
            </TableHead>
            <TableHead className="sticky top-0 bg-card align-middle">
              Verlegt von
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {postponements.map((postponement) => {
            const whitePlayer = postponement.game.whiteParticipant;
            const blackPlayer = postponement.game.blackParticipant;

            const participantId = whitePlayer?.id || blackPlayer?.id;
            invariant(participantId, "Game must have at least one participant");

            const matchday = postponement.game.matchdayGame?.matchday;
            invariant(matchday, "Game must have a matchday");

            const gameUrl = buildGameViewUrl({
              tournamentId,
              groupId: postponement.game.group.id,
              round: postponement.game.round,
              participantId,
              matchdayId: matchday.id,
            });

            return (
              <TableRow
                key={postponement.id}
                onClick={() => handleNavigate(gameUrl)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="hidden md:table-cell w-16 text-center align-middle">
                  {postponement.game.round}
                </TableCell>
                <TableCell className="hidden md:table-cell w-16 text-center align-middle">
                  <Badge variant="secondary">
                    {postponement.game.group.groupName}
                  </Badge>
                </TableCell>
                <TableCell className="w-40 truncate align-middle">
                  {whitePlayer ? (
                    <>
                      {whitePlayer.profile.firstName}{" "}
                      {whitePlayer.profile.lastName}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="w-40 truncate align-middle">
                  {blackPlayer ? (
                    <>
                      {blackPlayer.profile.firstName}{" "}
                      {blackPlayer.profile.lastName}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell w-24 text-center align-middle">
                  <span className="text-sm">
                    {toDateString(toLocalDateTime(postponement.from))}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell w-24 text-center align-middle">
                  <span className="text-sm font-medium">
                    {toDateString(toLocalDateTime(postponement.to))}
                  </span>
                </TableCell>
                <TableCell className="w-32 truncate align-middle">
                  <span className="text-sm text-muted-foreground">
                    {postponement.postponedByProfile.firstName}{" "}
                    {postponement.postponedByProfile.lastName}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
