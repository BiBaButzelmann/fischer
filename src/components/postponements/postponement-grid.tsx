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

type Props = {
  postponements: GamePostponementWithDetails[];
  isAdmin?: boolean;
};

export function PostponementGrid({ postponements, isAdmin = false }: Props) {
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

                return (
                  <TableRow key={postponement.id}>
                    <TableCell className="font-medium">
                      {postponement.game.round}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {postponement.game.group.groupName}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
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
