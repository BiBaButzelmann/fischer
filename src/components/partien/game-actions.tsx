import {
  GameResult,
  GameWithParticipantProfilesAndGroupAndMatchday,
} from "@/db/types/game";
import { MatchDay } from "@/db/types/match-day";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { PostponeGameDialog } from "./postpone-game-dialog";
import { ReportResultDialog } from "./report-result-dialog";
import { isGameActuallyPlayed } from "@/lib/game-auth";
import { DateTime } from "luxon";

type Props = {
  gameId: number;
  currentResult: GameResult | null;
  onResultChange: (gameId: number, result: GameResult) => Promise<void>;
  availableMatchdays: MatchDay[];
  currentGameDate: DateTime;
  game: GameWithParticipantProfilesAndGroupAndMatchday;
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
  game,
  isReferee,
  canView,
  canSubmitResult,
  canPostpone,
}: Props) {
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
          game={game}
        />
      )}
      {canView && isGameActuallyPlayed(currentResult) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/partien/${gameId}`}>
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
