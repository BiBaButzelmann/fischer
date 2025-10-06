"use client";

import { Sidepanel } from "./sidepanel";
import { EnginePanel } from "./engine-panel";
import { MoveHistory } from "./move-history";
import { PgnEditorActions } from "./pgn-actions";

type Props = {
  history: { san: string }[];
  currentMoveIndex: number;
  goToMove: (ply: number) => void;
  onSave: () => void;
  onDownload: () => void;
  onUpload: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  fen: string;
};

export function PgnEditorSidepanel({
  history,
  currentMoveIndex,
  goToMove,
  onSave,
  onDownload,
  onUpload,
  isSaving = false,
  hasUnsavedChanges = false,
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
    <PgnEditorActions
      onSave={onSave}
      onDownload={onDownload}
      onUpload={onUpload}
      isSaving={isSaving}
      hasUnsavedChanges={hasUnsavedChanges}
    />
  );

  return <Sidepanel header={header} content={content} footer={footer} />;
}
