"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import { toGermanNotation } from "@/lib/chess-notation";

type Props = {
  moves: { san: string }[];
  currentIndex: number;
  setCurrentIndex: (ply: number) => void;
};

export function MoveHistory({ moves, currentIndex, setCurrentIndex }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentMoveRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      if (currentIndex === -1) {
        container.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else if (currentMoveRef.current) {
        const moveElement = currentMoveRef.current;
        const containerHeight = container.clientHeight;
        const moveTop = moveElement.offsetTop;
        const moveHeight = moveElement.offsetHeight;

        const targetScrollTop = moveTop - containerHeight / 2 + moveHeight / 2;

        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex]);

  const rows: React.ReactNode[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const white = moves[i];
    const black = moves[i + 1];

    const whitePly = i;
    const blackPly = i + 1;

    rows.push(
      <tr key={i} className="border-b border-border/30">
        <td className="pl-2 pr-1 py-1.5 text-left select-none text-muted-foreground font-medium min-w-[1.5rem] text-xs">
          {i / 2 + 1}.
        </td>
        <td
          ref={currentIndex === whitePly ? currentMoveRef : null}
          className={clsx(
            "px-2 py-1.5 cursor-pointer rounded-sm transition-all duration-150 font-mono text-sm min-w-[3rem]",
            "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
            currentIndex === whitePly
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-foreground",
          )}
          onClick={() => setCurrentIndex(whitePly)}
        >
          {white ? toGermanNotation(white.san) : "…"}
        </td>
        <td
          ref={currentIndex === blackPly && black ? currentMoveRef : null}
          className={clsx(
            "px-2 py-1.5 rounded-sm transition-all duration-150 font-mono text-sm min-w-[3rem]",
            black
              ? "cursor-pointer hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
              : "cursor-default",
            currentIndex === blackPly && black
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-foreground",
          )}
          onClick={black ? () => setCurrentIndex(blackPly) : undefined}
        >
          {black ? toGermanNotation(black.san) : "…"}
        </td>
      </tr>,
    );
  }

  return (
    <div className="h-full flex flex-col border-t">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
      >
        <table className="w-full">
          <tbody className="divide-y divide-border/30">
            {rows.length > 0 ? (
              rows
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground text-sm"
                >
                  Noch keine Züge
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
