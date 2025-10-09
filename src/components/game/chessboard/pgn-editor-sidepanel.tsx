"use client";

import { Sidepanel } from "./sidepanel";
import { EnginePanel } from "./engine-panel";
import { MoveHistory } from "./move-history";
import { PgnEditorActions } from "./pgn-actions";
import { Move } from "chess.js";

type Props = {
  moves: Move[];
  currentIndex: number;
  setCurrentIndex: (ply: number) => void;
  setMoves: (moves: Move[]) => void;
  pgn: string;
  gameId: number;
  fen: string;
};

export function PgnEditorSidepanel({
  moves,
  currentIndex,
  setCurrentIndex,
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
          moves={moves}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      }
      footer={
        <PgnEditorActions
          pgn={pgn}
          gameId={gameId}
          setMoves={setMoves}
          setCurrentIndex={setCurrentIndex}
        />
      }
    />
  );
}
