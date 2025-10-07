"use client";

import { Sidepanel } from "./sidepanel";
import { EnginePanel } from "./engine-panel";
import { MoveHistory } from "./move-history";
import { PgnViewerActions } from "./pgn-actions";

type Props = {
  history: { san: string }[];
  currentMoveIndex: number;
  goToMove: (ply: number) => void;
  onDownload: () => void;
  fen: string;
};

export function PgnViewerSidepanel({
  history,
  currentMoveIndex,
  goToMove,
  onDownload,
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
      footer={<PgnViewerActions onDownload={onDownload} />}
    />
  );
}
