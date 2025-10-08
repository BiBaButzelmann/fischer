"use client";

import { Sidepanel } from "./sidepanel";
import { EnginePanel } from "./engine-panel";
import { MoveHistory } from "./move-history";
import { PgnEditorActions } from "./pgn-actions";
import { Move } from "chess.js";

type Props = {
  history: { san: string }[];
  currentMoveIndex: number;
  goToMove: (ply: number) => void;
  setMoves: (moves: Move[]) => void;
  pgn: string;
  gameId: number;
  fen: string;
};

export function PgnEditorSidepanel({
  history,
  currentMoveIndex,
  goToMove,
  setMoves,
  pgn,
  gameId,
  fen,
}: Props) {
  return (
    <Sidepanel
      header={<EnginePanel fen={fen} />}
      content={
        <MoveHistory
          history={history}
          currentMoveIndex={currentMoveIndex}
          goToMove={goToMove}
        />
      }
      footer={
        <PgnEditorActions
          pgn={pgn}
          gameId={gameId}
          setMoves={setMoves}
          setCurrentIndex={goToMove}
        />
      }
    />
  );
}
