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
  const header = <EnginePanel fen={fen} />;
  
  const content = (
    <MoveHistory
      history={history}
      currentMoveIndex={currentMoveIndex}
      goToMove={goToMove}
    />
  );

  const footer = (
    <PgnViewerActions onDownload={onDownload} />
  );

  return <Sidepanel header={header} content={content} footer={footer} />;
}