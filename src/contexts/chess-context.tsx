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
import { computeFenForIndex, computePGNFromMoves } from "@/lib/chess-utils";

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
  forward: () => void;
  back: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  undo: () => void;
  goToMove: (index: number) => void;

  addMove: (move: Move) => boolean;
  insertAtMove: (move: Move, idx: number) => boolean;
  getPgn: () => string;
  getAllMoves: () => Move[];
  getPiece: (square: string) => Piece | null;
  loadPgn: (pgn: string) => void;
};

const ChessContext = createContext<ChessContextType | null>(null);

type Props = {
  children: ReactNode;
  headers: PgnHeader;
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

  const fen = useMemo(() => {
    return computeFenForIndex(moves, currentIndex);
  }, [moves, currentIndex]);

  const forward = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, moves.length - 1));
  }, [moves.length]);

  const back = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, -1));
  }, []);

  const goToStart = useCallback(() => {
    setCurrentIndex(-1);
  }, []);

  const goToEnd = useCallback(() => {
    setCurrentIndex(moves.length - 1);
  }, [moves.length]);

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

  const addMove = useCallback(
    (move: Move) => {
      const chess = chessRef.current!;

      if (chess.isGameOver()) {
        return false;
      }

      try {
        const madeMove = chess.move(move);
        if (madeMove) {
          const newMoves = [...moves, madeMove];
          setMoves(newMoves);
          setCurrentIndex(newMoves.length - 1);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [moves],
  );

  const insertAtMove = useCallback(
    (move: Move, idx: number) => {
      invariant(
        idx <= moves.length,
        `Index ${idx} cannot be greater than ${moves.length}`,
      );

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
    [moves],
  );

  const getPgn = useCallback(() => {
    return computePGNFromMoves(moves);
  }, [moves]);

  const getAllMoves = useMemo(() => moves, [moves]);

  const getPiece = useCallback(
    (square: string) => {
      const tempChess = new Chess();
      for (let i = 0; i <= currentIndex && i < moves.length; i++) {
        tempChess.move(moves[i]);
      }
      return tempChess.get(square as Square) || null;
    },
    [moves, currentIndex],
  );

  const loadPgn = useCallback((pgn: string) => {
    const chess = chessRef.current!;
    chess.clear({ preserveHeaders: true });
    chess.loadPgn(pgn);
    const newMoves = chess.history({ verbose: true });
    setMoves(newMoves);
    setCurrentIndex(newMoves.length - 1);
  }, []);

  const contextValue = useMemo(
    (): ChessContextType => ({
      currentIndex,
      fen,
      forward,
      back,
      goToStart,
      goToEnd,
      undo,
      goToMove,
      addMove,
      insertAtMove,
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
      goToStart,
      goToEnd,
      undo,
      goToMove,
      addMove,
      insertAtMove,
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
