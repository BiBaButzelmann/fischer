"use client";

import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

interface ChessBoardProps {
  onMove: (move: string) => void;
  currentMoveIndex: number;
  moves: string[];
}

export function ChessBoard({
  onMove,
  currentMoveIndex,
  moves,
}: ChessBoardProps) {
  const [game, setGame] = useState<Chess | null>(null);
  const [boardPosition, setBoardPosition] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );

  // Initialize game on mount
  useEffect(() => {
    const newGame = new Chess();
    setGame(newGame);
  }, []);

  // Update board position when navigating through moves
  useEffect(() => {
    if (!game) return;

    try {
      const newGame = new Chess();

      // Replay moves up to current index
      for (let i = 0; i <= currentMoveIndex && i < moves.length; i++) {
        if (moves[i]) {
          const moveResult = newGame.move(moves[i]);
          if (!moveResult) {
            console.error("Invalid move:", moves[i]);
            break;
          }
        }
      }

      setBoardPosition(newGame.fen());
    } catch (error) {
      console.error("Error updating board position:", error);
    }
  }, [currentMoveIndex, moves, game]);

  function makeAMove(move: any) {
    if (!game) return false;

    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);

      if (result) {
        setGame(gameCopy);
        setBoardPosition(gameCopy.fen());
        onMove(result.san);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error making move:", error);
      return false;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    return move;
  }

  if (!game) {
    return (
      <div className="max-w-2xl mx-auto h-96 bg-gray-700 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Loading chessboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Chessboard
        position={boardPosition}
        onPieceDrop={onDrop}
        boardWidth={600}
        customBoardStyle={{
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
        customDarkSquareStyle={{ backgroundColor: "#b58863" }}
        customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
      />
    </div>
  );
}
