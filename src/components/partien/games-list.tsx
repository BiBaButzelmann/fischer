"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { resultEnum } from "@/db/schema/game";
import { Button } from "../ui/button";
import { Handshake, NotebookPen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";

type GameListProps = {
  games: {
    id: number;
    boardNumber: number;
    round: number;
    result: (typeof resultEnum.enumValues)[number] | null;
    whiteParticipant: {
      fideRating: number | null;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
    blackParticipant: {
      fideRating: number | null;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }[];
};

const resultDisplay = {
  draw: "½-½",
  white_wins: "1-0",
  black_wins: "0-1",
};

export function GamesList({ games }: GameListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Brett</TableHead>
          <TableHead>Runde</TableHead>
          <TableHead>Weiß</TableHead>
          <TableHead>Schwarz</TableHead>
          <TableHead>Ergebnis</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {games.map((game) => (
          <TableRow key={game.id}>
            <TableCell>
              <Badge variant="outline">{game.boardNumber}</Badge>
            </TableCell>
            <TableCell>{game.round}</TableCell>
            <TableCell>
              {game.whiteParticipant.profile.firstName}{" "}
              {game.whiteParticipant.profile.lastName}
              {game.whiteParticipant.fideRating && (
                <span className="ml-2 text-muted-foreground text-sm">
                  ({game.whiteParticipant.fideRating})
                </span>
              )}
            </TableCell>
            <TableCell>
              {game.blackParticipant.profile.firstName}{" "}
              {game.blackParticipant.profile.lastName}
              {game.blackParticipant.fideRating && (
                <span className="ml-2 text-muted-foreground text-sm">
                  ({game.blackParticipant.fideRating})
                </span>
              )}
            </TableCell>
            <TableCell>
              {game.result ? resultDisplay[game.result] : "-"}
            </TableCell>
            <TableCell className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/partien/${game.id}`}>
                    <Button
                      aria-label="Partie eingeben"
                      variant="outline"
                      size="icon"
                    >
                      <NotebookPen className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Partie bearbeiten</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Ergebnis melden"
                    variant="outline"
                    size="icon"
                  >
                    <Handshake className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ergebnis melden</p>
                </TooltipContent>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
