"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
  useState,
} from "react";
import { Move, Piece, Chess, Square } from "chess.js";
import invariant from "tiny-invariant";
import { computePGNFromMoves, getHeadersFromGame } from "@/lib/chess-utils";
import { toast } from "sonner";
import { START_FEN } from "@/constants/constants";
import { GameWithParticipantsAndPGNAndDate } from "@/db/types/game";

export type PgnHeader = {
  event: string;
  site: string;
  date: string;
  round: string;
  white: string;
  black: string;
  result: string;
};

type ChessContextType = {
  currentIndex: number;
  fen: string;
  moves: Move[];
  pgn: string;
  forward: () => void;
  back: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  setCurrentIndex: (index: number) => void;
  makeMove: (move: Pick<Move, "from" | "to" | "promotion">) => boolean;
  getPiece: (square: Square) => Piece | null;
  loadPgn: (pgn: string) => boolean;
};

const ChessContext = createContext<ChessContextType | null>(null);
function applyHeaders(chess: Chess, headerRecord: Record<string, string>) {
  for (const [key, value] of Object.entries(headerRecord)) {
    if (value) {
      chess.setHeader(key, value);
    }
  }
}

type Props = {
  children: ReactNode;
  game: GameWithParticipantsAndPGNAndDate;
};

export function ChessProvider({ children, game }: Props) {
  const headers = useMemo(() => getHeadersFromGame(game), [game]);

  const [moves, setMoves] = useState<Move[]>(() => {
    const chess = new Chess();
    applyHeaders(chess, headers);
    if (game.pgn?.value) {
      try {
        chess.loadPgn(game.pgn.value);
      } catch {
        toast.error("Fehler beim Laden der gespeicherten PGN");
      }
    }
    return chess.history({ verbose: true });
  });

  const [currentIndex, setCurrentIndexState] = useState(() =>
    moves.length > 0 ? moves.length - 1 : -1,
  );

  const lastIndex = moves.length - 1;

  const fen = useMemo(() => {
    if (currentIndex < 0) {
      return START_FEN;
    }
    return moves[currentIndex].after;
  }, [moves, currentIndex]);

  const pgn = useMemo(() => {
    return computePGNFromMoves(moves, headers);
  }, [moves, headers]);

  const setCurrentIndex = useCallback(
    (index: number) => {
      setCurrentIndexState(() => {
        return Math.max(-1, Math.min(index, lastIndex));
      });
    },
    [lastIndex],
  );

  const forward = useCallback(() => {
    setCurrentIndexState((prev) => Math.min(prev + 1, lastIndex));
  }, [lastIndex]);

  const back = useCallback(() => {
    setCurrentIndexState((prev) => Math.max(prev - 1, -1));
  }, []);

  const goToStart = useCallback(() => {
    setCurrentIndex(-1);
  }, [setCurrentIndex]);

  const goToEnd = useCallback(() => {
    setCurrentIndex(lastIndex);
  }, [setCurrentIndex, lastIndex]);

  const makeMove = useCallback(
    ({
      from,
      to,
      promotion,
    }: Pick<Move, "from" | "to" | "promotion">): boolean => {
      const idx = currentIndex + 1;

      invariant(
        idx <= moves.length,
        `Index ${idx} cannot be greater than ${moves.length}`,
      );

      const chess = new Chess(fen);

      if (chess.isGameOver()) {
        return false;
      }

      try {
        const moveOptions: { from: string; to: string; promotion?: string } = {
          from,
          to,
        };
        if (promotion) {
          moveOptions.promotion = promotion;
        }

        const move = chess.move(moveOptions);
        if (move) {
          const newMoves = [...moves.slice(0, idx), move];
          setMoves(newMoves);
          setCurrentIndexState(idx);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [moves, currentIndex, fen],
  );

  const getPiece = useCallback(
    (square: Square) => {
      const board = new Chess(fen);
      return board.get(square as Square) || null;
    },
    [fen],
  );

  const loadPgn = useCallback(
    (pgn: string) => {
      const chess = new Chess();
      applyHeaders(chess, headers);

      try {
        chess.loadPgn(pgn);
      } catch {
        return false;
      }

      const newMoves = chess.history({ verbose: true });
      setMoves(newMoves);
      setCurrentIndexState(newMoves.length > 0 ? newMoves.length - 1 : -1);
      return true;
    },
    [headers],
  );

  const contextValue = useMemo(
    (): ChessContextType => ({
      currentIndex,
      fen,
      moves,
      pgn,
      forward,
      back,
      goToStart,
      goToEnd,
      setCurrentIndex,
      makeMove,
      getPiece,
      loadPgn,
    }),
    [
      currentIndex,
      fen,
      moves,
      pgn,
      forward,
      back,
      goToStart,
      goToEnd,
      setCurrentIndex,
      makeMove,
      getPiece,
      loadPgn,
    ],
  );

  return (
    <ChessContext.Provider value={contextValue}>
      {children}
    </ChessContext.Provider>
  );
}

export function useChess() {
  const context = useContext(ChessContext);
  if (!context) {
    throw new Error("useChess must be used within a ChessProvider");
  }
  return context;
}
