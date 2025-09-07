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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayLongDate, toLocalDateTime } from "@/lib/date";
import type { GamePostponementWithDetails } from "@/db/types/game-postponement";
import { CalendarDays, Users } from "lucide-react";
import Link from "next/link";
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
  if (postponements.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Keine Partienverlegungen
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Es wurden noch keine Partien im aktuellen Turnier verlegt."
              : "Du hast noch keine Partien verlegt."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Partienverlegungen
          <Badge variant="secondary" className="ml-auto">
            {postponements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Runde</TableHead>
                <TableHead>Gruppe</TableHead>
                <TableHead>Weiß</TableHead>
                <TableHead>Schwarz</TableHead>
                <TableHead>Von</TableHead>
                <TableHead>Nach</TableHead>
                <TableHead>Verlegt von</TableHead>
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
                  <TableRow key={postponement.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={gameUrl}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {postponement.game.round}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={gameUrl}>
                        <Badge
                          variant="outline"
                          className="hover:bg-accent cursor-pointer"
                        >
                          {postponement.game.group.groupName}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={gameUrl}
                        className="block hover:text-blue-600"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {whitePlayer ? (
                            <>
                              {whitePlayer.profile.firstName}{" "}
                              {whitePlayer.profile.lastName}
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={gameUrl}
                        className="block hover:text-blue-600"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {blackPlayer ? (
                            <>
                              {blackPlayer.profile.firstName}{" "}
                              {blackPlayer.profile.lastName}
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {displayLongDate(toLocalDateTime(postponement.from))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {displayLongDate(toLocalDateTime(postponement.to))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {postponement.postponedByProfile.firstName}{" "}
                        {postponement.postponedByProfile.lastName}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
