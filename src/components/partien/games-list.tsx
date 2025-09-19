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
import { useRouter } from "next/navigation";
import { MatchDay } from "@/db/types/match-day";
import { authClient } from "@/auth-client";
import { Role } from "@/db/types/role";
import { GameActions } from "./game-actions";
import {
  getCurrentLocalDateTime,
  toDateString,
  toLocalDateTime,
  isSameDate,
} from "@/lib/date";
import { getParticipantFullName } from "@/lib/participant";

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
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const isAdmin = userRoles.includes("admin");
  const isReferee = userRoles.includes("referee");
  const isParticipant = userRoles.includes("participant");
  const isMatchEnteringHelper = userRoles.includes("matchEnteringHelper");

  const gameParticipantsMap = useMemo(
    () =>
      Object.fromEntries(
        games.map((game) => [
          game.id,
          [
            game.whiteParticipant!.profile.userId,
            game.blackParticipant!.profile.userId,
          ],
        ]),
      ),
    [games],
  );

  const getGameActionPermissions = useCallback(
    (gameId: number) => {
      const isGameParticipant = gameParticipantsMap[gameId]?.includes(
        userId || "",
      );

      const game = games.find((g) => g.id === gameId);
      const isGameInPastOrToday = game
        ? toLocalDateTime(game.matchdayGame.matchday.date) <
            getCurrentLocalDateTime() ||
          isSameDate(
            toLocalDateTime(game.matchdayGame.matchday.date),
            getCurrentLocalDateTime(),
          )
        : false;

      return {
        canView: isParticipant || isReferee || isMatchEnteringHelper || isAdmin,
        canSubmitResult:
          (isGameParticipant || isReferee || isAdmin) && isGameInPastOrToday,
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
      games,
    ],
  );

  const hasAnyActions = useMemo(() => {
    return games.some((game) => {
      const { canView, canSubmitResult, canPostpone } =
        getGameActionPermissions(game.id);
      return canView || canSubmitResult || canPostpone;
    });
  }, [games, getGameActionPermissions]);

  const handleNavigate = (gameId: number) => {
    router.push(`/partien/${gameId}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="hidden lg:block">
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
              <TableHead className="w-8 sticky top-0 bg-card">Weiß</TableHead>
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
            {games.map((game) => (
              <TableRow key={game.id} className="cursor-default">
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
                  {getParticipantFullName(game.whiteParticipant!)}
                  {(game.whiteParticipant!.dwzRating !== null ||
                    game.whiteParticipant!.fideRating !== null) && (
                    <span className="ml-2 text-muted-foreground text-sm">
                      (
                      {game.whiteParticipant!.dwzRating ??
                        game.whiteParticipant!.fideRating}
                      )
                    </span>
                  )}
                </TableCell>
                <TableCell className="w-20 text-center font-medium">
                  {game.result ? game.result.replace(":", " : ") : "-"}
                </TableCell>
                <TableCell className="w-40 truncate">
                  {getParticipantFullName(game.blackParticipant!)}
                  {(game.blackParticipant!.dwzRating !== null ||
                    game.blackParticipant!.fideRating !== null) && (
                    <span className="ml-2 text-muted-foreground text-sm">
                      (
                      {game.blackParticipant!.dwzRating ??
                        game.blackParticipant!.fideRating}
                      )
                    </span>
                  )}
                </TableCell>
                <TableCell className="w-24 text-center">
                  {toDateString(
                    toLocalDateTime(game.matchdayGame.matchday.date),
                  )}
                </TableCell>
                {hasAnyActions && (
                  <TableCell className="flex items-center gap-2">
                    <GameActions
                      gameId={game.id}
                      currentResult={game.result}
                      onResultChange={onResultChange}
                      availableMatchdays={availableMatchdays}
                      currentGameDate={toLocalDateTime(
                        game.matchdayGame.matchday.date,
                      )}
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
      <div className="lg:hidden divide-y">
        {games.map((game) => {
          const permissions = getGameActionPermissions(game.id);
          return (
            <div key={game.id} className="p-3 flex flex-col gap-2">
              <div
                className="flex flex-col gap-2"
                onClick={() => handleNavigate(game.id)}
                role="button"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1 py-0"
                    >
                      {game.group.groupName}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      Brett {game.boardNumber}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      Runde {game.round}
                    </Badge>
                  </span>
                  <span>
                    {toDateString(
                      toLocalDateTime(game.matchdayGame.matchday.date),
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex-shrink">
                    <div className="text-sm font-medium truncate">
                      {getParticipantFullName(game.whiteParticipant!)}
                    </div>
                    {(game.whiteParticipant!.dwzRating !== null ||
                      game.whiteParticipant!.fideRating !== null) && (
                      <div className="text-[11px] text-muted-foreground">
                        Elo/DWZ:{" "}
                        {game.whiteParticipant!.dwzRating ??
                          game.whiteParticipant!.fideRating}
                      </div>
                    )}
                  </div>
                  <div className="px-2 text-center font-semibold text-sm min-w-[52px]">
                    {game.result ? game.result.replace(":", " : ") : "-"}
                  </div>
                  <div className="flex-1 flex-shrink text-right">
                    <div className="text-sm font-medium truncate">
                      {getParticipantFullName(game.blackParticipant!)}
                    </div>
                    {(game.blackParticipant!.dwzRating !== null ||
                      game.blackParticipant!.fideRating !== null) && (
                      <div className="text-[11px] text-muted-foreground">
                        Elo/DWZ:{" "}
                        {game.blackParticipant!.dwzRating ??
                          game.blackParticipant!.fideRating}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {hasAnyActions &&
                (permissions.canView ||
                  permissions.canSubmitResult ||
                  permissions.canPostpone) && (
                  <div className="flex gap-1 pt-1">
                    <GameActions
                      gameId={game.id}
                      currentResult={game.result}
                      onResultChange={onResultChange}
                      availableMatchdays={availableMatchdays}
                      currentGameDate={toLocalDateTime(
                        game.matchdayGame.matchday.date,
                      )}
                      game={game}
                      isReferee={isReferee}
                      {...permissions}
                    />
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
