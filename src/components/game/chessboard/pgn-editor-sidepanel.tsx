"use client";

import { Sidepanel } from "./sidepanel";
import { EnginePanel } from "./engine-panel";
import { MoveHistory } from "./move-history";
import { PgnEditorActions } from "./pgn-actions";
import { useChess } from "@/contexts/chess-context";

type Props = {
  gameId: number;
};

export function PgnEditorSidepanel({ gameId }: Props) {
  const { moves, currentIndex, setCurrentIndex } = useChess();
  return (
    <Sidepanel
      header={<EnginePanel />}
      content={
        <MoveHistory
          moves={moves}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      }
      footer={<PgnEditorActions gameId={gameId} />}
    />
  );
}
