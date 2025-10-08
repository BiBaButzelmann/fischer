"use client";

import { Sidepanel } from "./sidepanel";
import { EnginePanel } from "./engine-panel";
import { MoveHistory } from "./move-history";
import { PgnViewerActions } from "./pgn-actions";

type Props = {
  moves: { san: string }[];
  currentIndex: number;
  setCurrentIndex: (ply: number) => void;
  pgn: string;
  gameId: number;
  fen: string;
};

export function PgnViewerSidepanel({
  moves,
  currentIndex,
  setCurrentIndex,
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
      footer={<PgnViewerActions pgn={pgn} gameId={gameId} />}
    />
  );
}
