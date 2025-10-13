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
  setCurrentIndex: (index: number) => void;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
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

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      const idx = currentIndex + 1;

      invariant(
        idx <= moves.length,
        `Index ${idx} cannot be greater than ${moves.length}`,
      );

      const chess = chessRef.current!;

      chess.clear();
      for (let i = 0; i <= currentIndex && i < moves.length; i++) {
        chess.move(moves[i]);
      }

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
          setCurrentIndex(idx);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [moves, currentIndex],
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
      setCurrentIndex,
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
      goToStart,
      goToEnd,
      setCurrentIndex,
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
