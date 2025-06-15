"use client";
import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import useSWR from "swr";
import { ChessBoard } from "@/components/chessboard";

type GameRow = { id: number; title: string; pgn: string };

const fetcher = <T,>(url: string) =>
  fetch(url).then((r) => r.json() as Promise<T>);
export default function ChessPage() {
  const [game, setGame] = useState(() => new Chess());
  const [selectedGameId, setSelectedGameId] = useState<number | "">("");

  const { data: games = [], mutate } = useSWR<GameRow[]>("/api/games", fetcher);

  const handleMove = (from: string, to: string) => {
    setGame((prev) => {
      const next = new Chess(prev.fen());
      next.move({ from, to, promotion: "q" });
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-6 grid md:grid-cols-3 gap-6">
      {/* UI-only component */}
      <ChessBoard game={game} onMove={handleMove} />

      {/* control column (dropdown + save button) … */}
    </div>
  );
}
