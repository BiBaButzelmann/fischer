"use client";

import { Chessboard } from "react-chessboard";
import { PgnEditorSidepanel } from "./pgn-editor-sidepanel";
import { PlayerDisplay } from "./player-display";
import { ParticipantWithName } from "@/db/types/participant";
import { getIndividualPlayerResult } from "@/lib/game-result-utils";
import { GameResult } from "@/db/types/game";
import { useChessEditor } from "@/hooks/use-chess-editor";

type Props = {
  gameId: number;
  initialPGN: string;
  whitePlayer: ParticipantWithName;
  blackPlayer: ParticipantWithName;
  gameResult: GameResult;
};

export default function PgnEditor({
  gameId,
  initialPGN,
  whitePlayer,
  blackPlayer,
  gameResult,
}: Props) {
  const {
    fen,
    onPieceDrop,
    onSquareClick,
    selectedSquare,
    moves,
    currentIndex,
    setCurrentIndex,
    setMoves,
    pgn,
  } = useChessEditor(initialPGN, gameId);

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
            arePiecesDraggable={true}
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            animationDuration={0}
            customSquareStyles={{
              ...(selectedSquare && {
                [selectedSquare]: {
                  boxShadow: "inset 0 0 1px 6px rgba(255,255,255,0.75)",
                },
              }),
            }}
          />
        </div>

        <PlayerDisplay
          participant={whitePlayer}
          result={getIndividualPlayerResult(gameResult, true)}
          className="rounded-b-lg"
        />
      </div>

      <div className="w-full lg:w-80 flex-shrink-0">
        <PgnEditorSidepanel
          moves={moves}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          setMoves={setMoves}
          pgn={pgn}
          gameId={gameId}
          fen={fen}
        />
      </div>
    </div>
  );
}
