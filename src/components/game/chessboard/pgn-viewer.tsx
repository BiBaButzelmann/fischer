"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useTransition,
  useRef,
} from "react";
import { Chess, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { savePGN } from "@/actions/pgn";
import { toast } from "sonner";
import { MoveHistory } from "./move-history";
import { PlayerDisplay } from "./player-display";
import { ParticipantWithName } from "@/db/types/participant";
import { getIndividualPlayerResult } from "@/lib/game-result-utils";
import { GameResult } from "@/db/types/game";

export type Props = {
  gameId: number;
  initialPGN: string;
  allowEdit?: boolean;
  whitePlayer: ParticipantWithName;
  blackPlayer: ParticipantWithName;
  gameResult: GameResult;
};

export default function PgnViewer({
  gameId,
  initialPGN,
  allowEdit = false,
  whitePlayer,
  blackPlayer,
  gameResult,
}: Props) {
  const [moves, setMoves] = useState(() => movesFromPGN(initialPGN));
  const [currentIndex, setCurrentIndex] = useState(moves.length - 1);
  const [isPending, startTransition] = useTransition();
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useChessboardControls({
    onArrowLeft: () => setCurrentIndex((i) => Math.max(-1, i - 1)),
    onArrowRight: () =>
      setCurrentIndex((i) => Math.min(moves.length - 1, i + 1)),
    onArrowUp: () => setCurrentIndex(-1),
    onArrowDown: () => setCurrentIndex(moves.length - 1),
  });

  const fen = useMemo(
    () => computeFenForIndex(moves, currentIndex),
    [moves, currentIndex],
  );

  const fullPGN = useMemo(() => computePGNFromMoves(moves), [moves]);

  const handleSave = useCallback(() => {
    startTransition(async () => {
      const result = await savePGN(fullPGN, gameId);

      if (result?.error) {
        toast.error("Fehler beim Speichern der Partie");
      } else {
        toast.success("Partie erfolgreich gespeichert");
      }
    });
  }, [fullPGN, gameId]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([fullPGN], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `game-${gameId}.pgn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("PGN erfolgreich heruntergeladen");
  }, [fullPGN, gameId]);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".pgn")) {
        toast.error("Bitte wähle eine .pgn Datei aus.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const trimmedContent = content.trim();
          if (!trimmedContent) {
            toast.error("PGN darf nicht leer sein.");
            return;
          }

          try {
            const newMoves = movesFromPGN(trimmedContent);
            setMoves(newMoves);
            setCurrentIndex(newMoves.length - 1);
            toast.success("PGN erfolgreich hochgeladen");
          } catch {
            toast.error("Ungültige PGN-Datei");
          }
        }
      };
      reader.readAsText(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [setMoves, setCurrentIndex],
  );

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      const boardState = currentBoardState(moves, currentIndex);

      try {
        const moveOptions: { from: string; to: string; promotion?: string } = {
          from,
          to,
        };
        if (promotion) {
          moveOptions.promotion = promotion;
        }

        const move = boardState.move(moveOptions);
        const updatedMoves = moves.slice(0, currentIndex + 1).concat(move);
        setMoves(updatedMoves);
        setCurrentIndex(updatedMoves.length - 1);
        return true;
      } catch {
        return false;
      }
    },
    [moves, currentIndex],
  );

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece?: string): boolean => {
      if (!allowEdit) return false;

      let promotion: string | undefined;
      if (piece && piece.length === 2) {
        const promotionPiece = piece[1].toLowerCase();
        if (["q", "r", "b", "n"].includes(promotionPiece)) {
          promotion = promotionPiece;
        }
      }

      return makeMove(sourceSquare, targetSquare, promotion);
    },
    [allowEdit, makeMove],
  );

  const handleSquareClick = useCallback(
    (square: string) => {
      if (!allowEdit) return;

      const boardState = currentBoardState(moves, currentIndex);
      const piece = boardState.get(square as Square);

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
        } else {
          makeMove(selectedSquare, square);
          setSelectedSquare(null);
        }
      } else {
        if (piece) {
          setSelectedSquare(square);
        }
      }
    },
    [allowEdit, moves, currentIndex, selectedSquare, makeMove],
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pgn"
        className="hidden"
        aria-hidden="true"
        onChange={handleFileChange}
      />
      <div className="flex-shrink-0 w-full max-w-lg mx-auto lg:mx-0 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <PlayerDisplay
          participant={blackPlayer}
          result={getIndividualPlayerResult(gameResult, false)}
          position="top"
        />

        <div className="aspect-square w-full">
          <Chessboard
            position={fen}
            arePiecesDraggable={allowEdit}
            onPieceDrop={handleDrop}
            onSquareClick={handleSquareClick}
            animationDuration={0}
            customSquareStyles={{
              ...(selectedSquare && {
                [selectedSquare]: {
                  boxShadow: "inset 0 0 1px 6px rgba(255,255,255,0.75)",
                },
              }),
            }}
          />
        </div>

        <PlayerDisplay
          participant={whitePlayer}
          result={getIndividualPlayerResult(gameResult, true)}
          position="bottom"
        />
      </div>

      <div className="w-full lg:w-80 flex-shrink-0">
        <MoveHistory
          history={moves}
          currentMoveIndex={currentIndex}
          goToMove={setCurrentIndex}
          onSave={allowEdit ? handleSave : undefined}
          onDownload={handleDownload}
          onUpload={allowEdit ? handleUpload : undefined}
          isSaving={isPending}
          showSave={allowEdit}
          showUpload={allowEdit}
        />
      </div>
    </div>
  );
}

function movesFromPGN(pgn: string): Move[] {
  const game = new Chess();
  game.loadPgn(pgn);
  return game.history({ verbose: true });
}

function currentBoardState(moves: Move[], index: number): Chess {
  const chess = new Chess();
  for (let i = 0; i <= index && i < moves.length; i++) {
    chess.move(moves[i]);
  }
  return chess;
}

function computeFenForIndex(moves: Move[], index: number): string {
  const currentState = currentBoardState(moves, index);
  return currentState.fen();
}

function computePGNFromMoves(moves: Move[]): string {
  const chess = new Chess();
  for (const move of moves) {
    chess.move(move);
  }
  return chess.pgn();
}

const useChessboardControls = ({
  onArrowLeft,
  onArrowRight,
  onArrowUp,
  onArrowDown,
}: {
  onArrowLeft: () => void;
  onArrowRight: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
}) => {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onArrowLeft();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onArrowRight();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onArrowUp();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onArrowDown();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onArrowLeft, onArrowRight, onArrowUp, onArrowDown]);
};
