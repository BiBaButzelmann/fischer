"use client";

import { Chessboard } from "react-chessboard";
import { PgnViewerSidepanel } from "./pgn-viewer-sidepanel";
import { PlayerDisplay } from "./player-display";
import { PgnViewerMobileActions } from "./pgn-actions";
import { ParticipantWithName } from "@/db/types/participant";
import { getIndividualPlayerResult } from "@/lib/game-result-utils";
import { GameResult } from "@/db/types/game";
import { useChessNavigation } from "@/hooks/use-chess-navigation";
import { useChess } from "@/contexts/chess-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { MoveHistory } from "./move-history";

type Props = {
  gameId: number;
  whitePlayer: ParticipantWithName;
  blackPlayer: ParticipantWithName;
  gameResult: GameResult;
};

export default function PgnViewer({
  gameId,
  whitePlayer,
  blackPlayer,
  gameResult,
}: Props) {
  const { fen } = useChess();
  useChessNavigation();

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100dvh-4rem)] space-y-2">
        <div className="flex-shrink-0 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <PlayerDisplay
            participant={blackPlayer}
            result={getIndividualPlayerResult(gameResult, false)}
            className="rounded-t-lg"
          />

          <div className="aspect-square w-full">
            <Chessboard
              position={fen}
              arePiecesDraggable={false}
              animationDuration={0}
            />
          </div>

          <PlayerDisplay
            participant={whitePlayer}
            result={getIndividualPlayerResult(gameResult, true)}
            className="rounded-b-lg"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-auto ">
          <MoveHistory />
        </div>

        <div className="flex-shrink-0">
          <PgnViewerMobileActions />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <div className="flex-shrink-0 w-full max-w-lg mx-auto lg:mx-0 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <PlayerDisplay
          participant={blackPlayer}
          result={getIndividualPlayerResult(gameResult, false)}
          className="rounded-t-lg"
        />

        <div className="aspect-square w-full">
          <Chessboard
            position={fen}
            arePiecesDraggable={false}
            animationDuration={0}
          />
        </div>

        <PlayerDisplay
          participant={whitePlayer}
          result={getIndividualPlayerResult(gameResult, true)}
          className="rounded-b-lg"
        />
      </div>

      <div className="w-full lg:w-80 flex-shrink-0">
        <PgnViewerSidepanel gameId={gameId} />
      </div>
    </div>
  );
}
