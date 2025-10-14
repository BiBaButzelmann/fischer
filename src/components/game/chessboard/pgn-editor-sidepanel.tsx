"use client";

import { Sidepanel } from "./sidepanel";
import { EnginePanel } from "./engine-panel";
import { MoveHistory } from "./move-history";
import { PgnEditorActions } from "./pgn-actions";

type Props = {
  gameId: number;
};

export function PgnEditorSidepanel({ gameId }: Props) {
  return (
    <Sidepanel
      header={<EnginePanel />}
      content={
        <MoveHistory />
      }
      footer={<PgnEditorActions gameId={gameId} />}
    />
  );
}
