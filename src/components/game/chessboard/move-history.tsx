"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  history: { san: string }[];
  currentMoveIndex: number;
  goToMove: (ply: number) => void;
  onSave?: () => void;
  isSaving?: boolean;
  showSave?: boolean;
};

export function MoveHistory({
  history,
  currentMoveIndex,
  goToMove,
  onSave,
  isSaving = false,
  showSave = false,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentMoveRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      if (currentMoveIndex === -1) {
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
  }, [currentMoveIndex]);

  const rows: React.ReactNode[] = [];
  for (let i = 0; i < history.length; i += 2) {
    const white = history[i];
    const black = history[i + 1];

    const whitePly = i;
    const blackPly = i + 1;

    rows.push(
      <tr key={i} className="border-b border-border/30">
        <td className="pr-3 py-1.5 text-right select-none text-muted-foreground font-medium min-w-[2.5rem] text-xs">
          {i / 2 + 1}.
        </td>
        <td
          ref={currentMoveIndex === whitePly ? currentMoveRef : null}
          className={clsx(
            "px-3 py-1.5 cursor-pointer rounded-sm transition-all duration-150 font-mono text-sm min-w-[4rem]",
            "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
            currentMoveIndex === whitePly
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-foreground",
          )}
          onClick={() => goToMove(whitePly)}
        >
          {white ? white.san : "…"}
        </td>
        <td
          ref={currentMoveIndex === blackPly && black ? currentMoveRef : null}
          className={clsx(
            "px-3 py-1.5 rounded-sm transition-all duration-150 font-mono text-sm min-w-[4rem]",
            black
              ? "cursor-pointer hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
              : "cursor-default",
            currentMoveIndex === blackPly && black
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-foreground",
          )}
          onClick={black ? () => goToMove(blackPly) : undefined}
        >
          {black ? black.san : "…"}
        </td>
      </tr>,
    );
  }

  return (
    <div className="w-full flex flex-col h-full max-h-[570px]">
      <div className="h-full rounded-lg border border-gray-200 bg-card text-card-foreground shadow-sm flex flex-col">
        <div className="flex flex-col space-y-1.5 p-4 pb-3 flex-shrink-0">
          <div className="font-semibold leading-none tracking-tight flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Notation
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="h-full px-4 pb-4">
            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto rounded-md border bg-background/50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
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
        </div>
        {showSave && onSave && (
          <div className="px-4 pb-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
