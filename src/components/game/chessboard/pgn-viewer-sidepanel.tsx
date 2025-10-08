"use client";

import { Sidepanel } from "./sidepanel";
import { EnginePanel } from "./engine-panel";
import { MoveHistory } from "./move-history";
import { PgnViewerActions } from "./pgn-actions";

type Props = {
  history: { san: string }[];
  currentMoveIndex: number;
  goToMove: (ply: number) => void;
  pgn: string;
  gameId: number;
  fen: string;
};

export function PgnViewerSidepanel({
  history,
  currentMoveIndex,
  goToMove,
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
      footer={<PgnViewerActions pgn={pgn} gameId={gameId} />}
    />
  );
}
