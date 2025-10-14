"use client";

import { Sidepanel } from "./sidepanel";
import { EnginePanel } from "./engine-panel";
import { MoveHistory } from "./move-history";
import { PgnViewerActions } from "./pgn-actions";

type Props = {
  gameId: number;
};

export function PgnViewerSidepanel({ gameId }: Props) {
  return (
    <Sidepanel
      header={<EnginePanel />}
      content={
        <MoveHistory />
      }
      footer={<PgnViewerActions gameId={gameId} />}
    />
  );
}
