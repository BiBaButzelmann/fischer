"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useRef,
  useMemo,
  useState,
} from "react";
import { Move, Piece, Chess, Square } from "chess.js";
import invariant from "tiny-invariant";
import { computePGNFromMoves } from "@/lib/chess-utils";
import { toast } from "sonner";

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

function toHeaderRecord(headers: PgnHeader): Record<string, string> {
  return {
    Event: headers.event,
    Site: headers.site,
    Date: headers.date,
    Round: headers.round,
    White: headers.white,
    Black: headers.black,
    Result: normalizeResult(headers.result),
  };
}

//TODO: cleanup db entries, all results shall be stored with a "-"
function normalizeResult(result: string): string {
  const trimmed = result.trim();
  return trimmed.includes(":") ? trimmed.replace(/:/g, "-") : trimmed;
}
function applyHeaders(chess: Chess, headerRecord: Record<string, string>) {
  for (const [key, value] of Object.entries(headerRecord)) {
    if (value) {
      chess.setHeader(key, value);
    }
  }
}

type Props = {
  children: ReactNode;
  headers: PgnHeader;
  initialPgn?: string;
};

export function ChessProvider({ children, headers, initialPgn }: Props) {
  const headersRef = useRef<Record<string, string>>(toHeaderRecord(headers));

  const [moves, setMoves] = useState<Move[]>(() => {
    const chess = new Chess();
    applyHeaders(chess, headersRef.current);
    if (initialPgn) {
      try {
        chess.loadPgn(initialPgn);
      } catch {
        toast.error("Fehler beim Laden der gespeicherten PGN");
      }
    }
    return chess.history({ verbose: true });
  });

  const [currentIndex, setCurrentIndexState] = useState(() =>
    moves.length > 0 ? moves.length - 1 : -1,
  );

  const fen = useMemo(() => {
    if (currentIndex < 0) {
      return new Chess().fen();
    }
    return moves[currentIndex].after;
  }, [moves, currentIndex]);

  const pgn = useMemo(() => {
    return computePGNFromMoves(moves, headersRef.current);
  }, [moves]);

  const setCurrentIndex = useCallback(
    (index: number) => {
      setCurrentIndexState(() => {
        const maxIndex = moves.length - 1;
        return Math.max(-1, Math.min(index, maxIndex));
      });
    },
    [moves.length],
  );

  const forward = useCallback(() => {
    setCurrentIndexState((prev) => Math.min(prev + 1, moves.length - 1));
  }, [moves.length]);

  const back = useCallback(() => {
    setCurrentIndexState((prev) => Math.max(prev - 1, -1));
  }, []);

  const goToStart = useCallback(() => {
    setCurrentIndexState(-1);
  }, []);

  const goToEnd = useCallback(() => {
    setCurrentIndexState(moves.length - 1);
  }, [moves.length]);

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

  const loadPgn = useCallback((pgn: string) => {
    const chess = new Chess();
    applyHeaders(chess, headersRef.current);

    try {
      chess.loadPgn(pgn);
    } catch {
      return false;
    }

    const newMoves = chess.history({ verbose: true });
    setMoves(newMoves);
    setCurrentIndexState(newMoves.length > 0 ? newMoves.length - 1 : -1);
    return true;
  }, []);

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
