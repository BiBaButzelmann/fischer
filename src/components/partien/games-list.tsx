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
import {
  GameResult,
  GameWithParticipantProfilesAndGroupAndMatchday,
} from "@/db/types/game";
import { useMemo, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { formatGameDate, getGameTimeFromGame } from "@/lib/game-time";
import { MatchDay } from "@/db/types/match-day";
import { authClient } from "@/auth-client";
import { Role } from "@/db/types/role";
import { GameActions } from "./game-actions";

type Props = {
  games: GameWithParticipantProfilesAndGroupAndMatchday[];
  onResultChange: (gameId: number, result: GameResult) => Promise<void>;
  availableMatchdays: MatchDay[];
  userRoles: Role[];
};

export function GamesList({
  games,
  onResultChange,
  availableMatchdays = [],
  userRoles = [],
}: Props) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const isAdmin = userRoles.includes("admin");
  const isReferee = userRoles.includes("referee");
  const isParticipant = userRoles.includes("participant");
  const isMatchEnteringHelper = userRoles.includes("matchEnteringHelper");

  // Filter out games without both participants
  const validGames = useMemo(
    () =>
      games.filter((game) => game.whiteParticipant && game.blackParticipant),
    [games],
  );

  const gameParticipantsMap = useMemo(
    () =>
      Object.fromEntries(
        validGames.map((game) => [
          game.id,
          [
            game.whiteParticipant!.profile.userId,
            game.blackParticipant!.profile.userId,
          ],
        ]),
      ),
    [validGames],
  );

  const getGameActionPermissions = useCallback(
    (gameId: number) => {
      const isGameParticipant = gameParticipantsMap[gameId]?.includes(
        userId || "",
      );

      return {
        canView: isParticipant || isReferee || isMatchEnteringHelper || isAdmin,
        canSubmitResult: isGameParticipant || isReferee || isAdmin,
        canPostpone: isGameParticipant || isAdmin,
      };
    },
    [
      gameParticipantsMap,
      userId,
      isParticipant,
      isReferee,
      isMatchEnteringHelper,
      isAdmin,
    ],
  );

  const hasAnyActions = useMemo(() => {
    return validGames.some((game) => {
      const { canView, canSubmitResult, canPostpone } =
        getGameActionPermissions(game.id);
      return canView || canSubmitResult || canPostpone;
    });
  }, [validGames, getGameActionPermissions]);

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
            {hasAnyActions && (
              <TableHead className="hidden md:table-cell sticky top-0 bg-card w-32">
                Aktionen
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {validGames.map((game) => (
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
                {game.whiteParticipant!.profile.firstName}{" "}
                {game.whiteParticipant!.profile.lastName}
                {game.whiteParticipant!.fideRating && (
                  <span className="ml-2 text-muted-foreground text-sm">
                    ({game.whiteParticipant!.fideRating})
                  </span>
                )}
              </TableCell>
              <TableCell className="w-20 text-center font-medium">
                {game.result ? game.result.replace(":", " : ") : "-"}
              </TableCell>
              <TableCell className="w-40 truncate">
                {game.blackParticipant!.profile.firstName}{" "}
                {game.blackParticipant!.profile.lastName}
                {game.blackParticipant!.fideRating && (
                  <span className="ml-2 text-muted-foreground text-sm">
                    ({game.blackParticipant!.fideRating})
                  </span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell w-24 text-center">
                {formatGameDate(getGameTimeFromGame(game))}
              </TableCell>
              {hasAnyActions && (
                <TableCell className="hidden md:flex items-center gap-2 w-32">
                  <GameActions
                    gameId={game.id}
                    currentResult={game.result}
                    onResultChange={onResultChange}
                    availableMatchdays={availableMatchdays}
                    currentGameDate={getGameTimeFromGame(game)}
                    game={game}
                    isReferee={isReferee}
                    {...getGameActionPermissions(game.id)}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
