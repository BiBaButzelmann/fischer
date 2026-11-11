"use client";

import type { updateGameResult } from "@/actions/game";
import { GameResult } from "@/db/types/game";
import { MatchDay } from "@/db/types/match-day";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { PostponeGameDialog } from "./postpone-game-dialog";
import { ReportResultDialog } from "./report-result-dialog";
import { isGameActuallyPlayed } from "@/lib/game-result-utils";
import { tournamentPath } from "@/lib/navigation";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";
import { DateTime } from "luxon";

type Props = {
  gameId: number;
  currentResult: GameResult | null;
  onResultChange: typeof updateGameResult;
  availableMatchdays: MatchDay[];
  currentGameDate: DateTime;
  whiteName: string;
  blackName: string;
  isReferee: boolean;
  canView: boolean;
  canSubmitResult: boolean;
  canPostpone: boolean;
};

export function GameActions({
  gameId,
  currentResult,
  onResultChange,
  availableMatchdays,
  currentGameDate,
  whiteName,
  blackName,
  isReferee,
  canView,
  canSubmitResult,
  canPostpone,
}: Props) {
  const slug = useTournamentSlug();

  return (
    <>
      {canSubmitResult && (
        <ReportResultDialog
          gameId={gameId}
          currentResult={currentResult}
          onResultChange={onResultChange}
          isReferee={isReferee}
        />
      )}
      {canPostpone && (
        <PostponeGameDialog
          gameId={gameId}
          availableMatchdays={availableMatchdays}
          currentGameDate={currentGameDate}
          whiteName={whiteName}
          blackName={blackName}
        />
      )}
      {canView && isGameActuallyPlayed(currentResult) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={tournamentPath(slug, `/partien/${gameId}`)}>
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
      )}
    </>
  );
}
