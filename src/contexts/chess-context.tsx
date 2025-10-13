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

export type PgnHeaders = {
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
  forward: () => void;
  back: () => void;
  undo: () => void;
  goToMove: (index: number) => void;
  makeMove: (move: Move, idx: number) => boolean;
  getPgn: () => string;
  getAllMoves: () => Move[];
  getPiece: (square: string) => Piece | null;
  loadPgn: (pgn: string) => void;
};

const ChessContext = createContext<ChessContextType | null>(null);

type Props = {
  children: ReactNode;
  headers: PgnHeaders;
  initialPgn?: string;
};

export function ChessProvider({ children, headers, initialPgn }: Props) {
  const chessRef = useRef<Chess>(new Chess());

  const [moves, setMoves] = useState<Move[]>(() => {
    const chess = new Chess();
    chess.setHeader("Event", headers.event);
    chess.setHeader("Site", headers.site);
    chess.setHeader("Date", headers.date);
    chess.setHeader("Round", headers.round);
    chess.setHeader("White", headers.white);
    chess.setHeader("Black", headers.black);
    chess.setHeader("Result", headers.result);

    chessRef.current = chess;

    if (initialPgn) {
      chess.loadPgn(initialPgn);
      return chess.history({ verbose: true });
    }

    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(() => moves.length - 1);

  const syncChessToPosition = useCallback(
    (targetIndex: number) => {
      const chess = chessRef.current!;
      chess.reset();

      chess.setHeader("Event", headers.event);
      chess.setHeader("Site", headers.site);
      chess.setHeader("Date", headers.date);
      chess.setHeader("Round", headers.round);
      chess.setHeader("White", headers.white);
      chess.setHeader("Black", headers.black);
      chess.setHeader("Result", headers.result);

      for (let i = 0; i <= targetIndex; i++) {
        if (moves[i]) {
          chess.move(moves[i].san);
        }
      }
    },
    [moves, headers],
  );

  const fen = useMemo(() => {
    syncChessToPosition(currentIndex);
    return chessRef.current!.fen();
  }, [currentIndex, syncChessToPosition]);

  const forward = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, moves.length - 1));
  }, [moves.length]);

  const back = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, -1));
  }, []);

  const goToMove = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(-1, Math.min(index, moves.length - 1)));
    },
    [moves.length],
  );

  const undo = useCallback(() => {
    if (moves.length > 0) {
      const newMoves = moves.slice(0, -1);
      setMoves(newMoves);
      setCurrentIndex((prev) => Math.min(prev, newMoves.length - 1));
    }
  }, [moves]);

  const makeMove = useCallback(
    (move: Move, idx: number) => {
      invariant(
        idx <= moves.length,
        `Index ${idx} cannot be greater than ${moves.length}`,
      );

      syncChessToPosition(idx - 1);
      const chess = chessRef.current!;

      if (chess.isGameOver()) {
        return false;
      }

      try {
        const madeMove = chess.move(move);
        if (madeMove) {
          const newMoves = [...moves.slice(0, idx), madeMove];
          setMoves(newMoves);
          setCurrentIndex(idx);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [moves, syncChessToPosition],
  );

  const getPgn = useCallback(() => {
    syncChessToPosition(currentIndex);
    return chessRef.current!.pgn();
  }, [currentIndex, syncChessToPosition]);

  const getAllMoves = useMemo(() => moves, [moves]);

  const getPiece = useCallback(
    (square: string) => {
      syncChessToPosition(currentIndex);
      return chessRef.current!.get(square as Square) || null;
    },
    [currentIndex, syncChessToPosition],
  );

  const loadPgn = useCallback(
    (pgn: string) => {
      const chess = chessRef.current!;
      chess.clear({ preserveHeaders: true });
      chess.loadPgn(pgn);
      const newMoves = chess.history({ verbose: true });
      setMoves(newMoves);
      setCurrentIndex(newMoves.length - 1);
    },
    [headers],
  );

  const contextValue = useMemo(
    (): ChessContextType => ({
      currentIndex,
      fen,
      forward,
      back,
      undo,
      goToMove,
      makeMove,
      getPgn,
      getAllMoves: () => getAllMoves,
      getPiece,
      loadPgn,
    }),
    [
      currentIndex,
      fen,
      forward,
      back,
      undo,
      goToMove,
      makeMove,
      getPgn,
      getAllMoves,
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
