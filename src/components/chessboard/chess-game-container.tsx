"use client";

import { useState } from "react";
import { ChessBoard } from "./chessboard";
import { PlayerSelector } from "./player-selector";
import { MoveHistory } from "./move-history";
import { GameControls } from "./game-controls";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface PlayerPairing {
  id: string;
  white: string;
  black: string;
}

interface PlayerGroups {
  [key: string]: PlayerPairing[];
}

interface ChessGameContainerProps {
  playerGroups: PlayerGroups;
}

export function ChessGameContainer({ playerGroups }: ChessGameContainerProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedPairing, setSelectedPairing] = useState<PlayerPairing | null>(
    null,
  );
  const [moves, setMoves] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setSelectedPairing(null);
    resetGame();
  };

  const handlePairingChange = (pairing: PlayerPairing) => {
    setSelectedPairing(pairing);
    resetGame();
  };

  const resetGame = () => {
    setMoves([]);
    setCurrentMoveIndex(-1);
  };

  const handleMove = (move: string) => {
    const newMoves = [...moves, move];
    setMoves(newMoves);
    setCurrentMoveIndex(newMoves.length - 1);
  };

  const handleSaveGame = () => {
    if (!selectedPairing || moves.length === 0) return;

    const gameData = {
      pairing: selectedPairing,
      moves: moves,
      pgn: moves.join(" "),
      timestamp: new Date().toISOString(),
    };

    console.log("Saving game:", gameData);
    alert(
      `Game saved successfully for ${selectedPairing.white} vs ${selectedPairing.black}!`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Spieler auswählen</h2>
        <PlayerSelector
          playerGroups={playerGroups}
          selectedGroup={selectedGroup}
          selectedPairing={selectedPairing}
          onGroupChange={handleGroupChange}
          onPairingChange={handlePairingChange}
        />
      </div>

      {/* Game Area - Only show when pairing is selected */}
      {selectedPairing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Chess Board */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">
                  {selectedPairing.white} (White) vs {selectedPairing.black}{" "}
                  (Black)
                </h3>
              </div>
              <ChessBoard
                onMove={handleMove}
                currentMoveIndex={currentMoveIndex}
                moves={moves}
              />
              <div className="mt-4 flex justify-between items-center">
                <GameControls
                  moves={moves}
                  currentMoveIndex={currentMoveIndex}
                  onMoveIndexChange={setCurrentMoveIndex}
                />
                <Button
                  onClick={handleSaveGame}
                  disabled={moves.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Save Game
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Move History */}
          <div className="lg:col-span-1">
            <MoveHistory
              moves={moves}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={setCurrentMoveIndex}
            />
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg">
            Please select a player pairing to start the game
          </p>
        </div>
      )}
    </div>
  );
}
