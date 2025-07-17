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
import { Button } from "../ui/button";
import { Handshake, NotebookPen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import {
  GameResult,
  GameWithParticipantNamesAndRatings,
} from "@/db/types/game";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMemo, useTransition } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";

type GameListProps = {
  userId: string | undefined;
  games: GameWithParticipantNamesAndRatings[];
  onResultChange: (gameId: number, result: GameResult) => Promise<void>;
};

export function GamesList({ userId, games, onResultChange }: GameListProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const gameParticipantsMap = useMemo(
    () =>
      Object.fromEntries(
        games.map((game) => [
          game.id,
          [
            game.whiteParticipant.profile.userId,
            game.blackParticipant.profile.userId,
          ],
        ]),
      ),
    [games],
  );

  const handleResultFormSubmit = (gameId: number) => {
    return async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const result = formData.get("result") as GameResult;
      startTransition(async () => {
        await onResultChange(gameId, result);
      });
    };
  };

  const handleNavigate = (gameId: number) => {
    router.push(`/partien/${gameId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden md:table-cell sticky top-0 bg-card">
            Brett
          </TableHead>
          <TableHead className="hidden md:table-cell sticky top-0 bg-card">
            Runde
          </TableHead>
          <TableHead className="sticky top-0 bg-card">Weiß</TableHead>
          <TableHead className="sticky top-0 bg-card">Schwarz</TableHead>
          <TableHead className="sticky top-0 bg-card">Ergebnis</TableHead>
          <TableHead className="hidden md:table-cell sticky top-0 bg-card"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {games.map((game) => (
          <TableRow
            key={game.id}
            onClick={isMobile ? () => handleNavigate(game.id) : undefined}
            className="cursor-default"
          >
            <TableCell className="hidden md:table-cell">
              <Badge variant="outline">{game.boardNumber}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{game.round}</TableCell>
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
            <TableCell>{game.result ?? "-"}</TableCell>
            <TableCell className="hidden md:flex items-center gap-2">
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
                  <p>Partie anschauen</p>
                </TooltipContent>
              </Tooltip>
              {userId != null &&
              gameParticipantsMap[game.id].includes(userId) ? (
                <Dialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          aria-label="Ergebnis melden"
                          variant="outline"
                          size="icon"
                        >
                          <Handshake className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ergebnis melden</p>
                    </TooltipContent>
                  </Tooltip>
                  <DialogContent>
                    <form onSubmit={handleResultFormSubmit(game.id)}>
                      <DialogHeader>
                        <DialogTitle>Ergebnis melden</DialogTitle>
                        <DialogDescription>
                          Melde hier das Ergebnis der Partie. Klicke speichern
                          wenn du fertig bist.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-2 py-4">
                        <Label
                          htmlFor={`result-select-${game.id}`}
                          className="font-medium"
                        >
                          Ergebnis
                        </Label>
                        <Select
                          name="result"
                          defaultValue={game.result ?? ""}
                          required
                        >
                          <SelectTrigger
                            id={`result-select-${game.id}`}
                            className="w-full"
                          >
                            <SelectValue placeholder="Ergebnis wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1:0">1-0</SelectItem>
                            <SelectItem value="0:1">0-1</SelectItem>
                            <SelectItem value="½-½">½-½</SelectItem>
                            <SelectItem value="+:-">1-0</SelectItem>
                            <SelectItem value="-:+">0-1</SelectItem>
                            <SelectItem value="0-½">0-½</SelectItem>
                            <SelectItem value="½-0">½-0</SelectItem>
                            <SelectItem value="-:-">0-0</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Schließen</Button>
                        </DialogClose>
                        <Button disabled={isPending} type="submit">
                          Speichern
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
