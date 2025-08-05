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
import { NotebookPen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import {
  GameResult,
  GameWithParticipantProfilesAndGroupAndMatchday,
} from "@/db/types/game";
import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { formatGameDate, getGameTimeFromGame } from "@/lib/game-time";
import { MatchDay } from "@/db/types/match-day";
import { PostponeGameDialog } from "./postpone-game-dialog";
import { ReportResultDialog } from "./report-result-dialog";
import { authClient } from "@/auth-client";

type Props = {
  games: GameWithParticipantNamesAndRatings[];
  onResultChange: (gameId: number, result: GameResult) => Promise<void>;
  availableMatchdays: MatchDay[];
};

export function GamesList({
  games,
  onResultChange,
  availableMatchdays = [],
}: Props) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

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

  const handleNavigate = (gameId: number) => {
    router.push(`/partien/${gameId}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center">
              Gruppe
            </TableHead>
            <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center">
              Brett
            </TableHead>
            <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center">
              Runde
            </TableHead>
            <TableHead className="sticky top-0 bg-card">Weiß</TableHead>
            <TableHead className="sticky top-0 bg-card text-center">
              Ergebnis
            </TableHead>
            <TableHead className="sticky top-0 bg-card">Schwarz</TableHead>
            <TableHead className="hidden md:table-cell sticky top-0 bg-card text-center">
              Datum
            </TableHead>
            {userId && (
              <TableHead className="hidden md:table-cell sticky top-0 bg-card w-32">
                Aktionen
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game) => (
            <TableRow
              key={game.id}
              onClick={isMobile ? () => handleNavigate(game.id) : undefined}
              className="cursor-default"
            >
              <TableCell className="hidden md:table-cell w-16 text-center">
                <Badge variant="secondary">{game.group.groupName}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell w-16 text-center">
                <Badge variant="outline">{game.boardNumber}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell w-16 text-center">
                {game.round}
              </TableCell>
              <TableCell className="w-40 truncate">
                {game.whiteParticipant.profile.firstName}{" "}
                {game.whiteParticipant.profile.lastName}
                {game.whiteParticipant.fideRating && (
                  <span className="ml-2 text-muted-foreground text-sm">
                    ({game.whiteParticipant.fideRating})
                  </span>
                )}
              </TableCell>
              <TableCell className="w-20 text-center font-medium">
                {game.result ? game.result.replace(":", " : ") : "-"}
              </TableCell>
              <TableCell className="w-40 truncate">
                {game.blackParticipant.profile.firstName}{" "}
                {game.blackParticipant.profile.lastName}
                {game.blackParticipant.fideRating && (
                  <span className="ml-2 text-muted-foreground text-sm">
                    ({game.blackParticipant.fideRating})
                  </span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell w-24 text-center">
                {formatGameDate(getGameTimeFromGame(game))}
              </TableCell>
              {userId && (
                <TableCell className="hidden md:flex items-center gap-2 w-32">
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
                  {/* TODO: Schiedsrichter darf Ergebnisse melden (global) */}
                  {(userId && gameParticipantsMap[game.id].includes(userId)) ||
                  userRole === "admin" ? (
                    <ReportResultDialog
                      gameId={game.id}
                      currentResult={game.result}
                      onResultChange={onResultChange}
                    />
                  ) : null}
                  {(userId && gameParticipantsMap[game.id].includes(userId)) ||
                  userRole === "admin" ? (
                    <PostponeGameDialog
                      gameId={game.id}
                      availableMatchdays={availableMatchdays}
                      currentGameDate={getGameTimeFromGame(game)}
                      game={game}
                    />
                  ) : null}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
