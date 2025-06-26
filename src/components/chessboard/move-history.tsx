"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

interface MoveHistoryProps {
  moves: string[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
}

export function MoveHistory({
  moves,
  currentMoveIndex,
  onMoveClick,
}: MoveHistoryProps) {
  const formatMoveNumber = (index: number) => {
    return Math.floor(index / 2) + 1;
  };

  const isWhiteMove = (index: number) => {
    return index % 2 === 0;
  };

  // Group moves into pairs (white, black)
  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    const whiteMove = moves[i];
    const blackMove = moves[i + 1] || "";
    const moveNumber = Math.floor(i / 2) + 1;

    movePairs.push({
      moveNumber,
      whiteMove,
      blackMove,
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-96">
      <h3 className="text-lg font-semibold mb-4">Move History</h3>
      <ScrollArea className="h-80">
        <div className="space-y-1">
          {movePairs.map((pair) => (
            <div
              key={pair.moveNumber}
              className="grid grid-cols-12 gap-1 text-sm"
            >
              {/* Move number */}
              <div className="col-span-2 text-gray-400 text-right pr-2">
                {pair.moveNumber}
              </div>

              {/* White move */}
              <div
                className={`col-span-5 p-1 rounded cursor-pointer hover:bg-gray-700 font-mono ${
                  pair.whiteIndex === currentMoveIndex ? "bg-blue-600" : ""
                }`}
                onClick={() => onMoveClick(pair.whiteIndex)}
              >
                {pair.whiteMove}
              </div>

              {/* Black move */}
              <div
                className={`col-span-5 p-1 rounded cursor-pointer hover:bg-gray-700 font-mono ${
                  pair.blackIndex === currentMoveIndex ? "bg-blue-600" : ""
                } ${!pair.blackMove ? "text-gray-600" : ""}`}
                onClick={() => pair.blackMove && onMoveClick(pair.blackIndex)}
              >
                {pair.blackMove || "..."}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
