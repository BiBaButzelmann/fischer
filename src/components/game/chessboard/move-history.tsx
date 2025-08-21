"use client";

import clsx from "clsx";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  history: { san: string }[];
  currentMoveIndex: number;
  goToMove: (ply: number) => void;
  onSave?: () => void;
  isSaving?: boolean;
  showSave?: boolean;
};

/**
 * Renders the moves in two columns (white / black) and highlights the cell
 * whose ply index equals `currentMoveIndex`.
 */
function MoveHistory({
  history,
  currentMoveIndex,
  goToMove,
  onSave,
  isSaving = false,
  showSave = false,
}: Props) {
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
          className={clsx(
            "px-3 py-1.5 cursor-pointer rounded-sm transition-all duration-150 font-mono text-sm min-w-[4rem]",
            "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
            currentMoveIndex === blackPly
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-foreground",
          )}
          onClick={() => goToMove(blackPly)}
        >
          {black ? black.san : "…"}
        </td>
      </tr>,
    );
  }

  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl border bg-card text-card-foreground shadow flex flex-col">
        <div className="flex flex-col space-y-1.5 p-4 pb-3">
          <div className="font-semibold leading-none tracking-tight flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Notation
            </div>
            {showSave && onSave && (
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 text-blue-600 border-blue-600 hover:bg-blue-50"
                onClick={onSave}
                disabled={isSaving}
              >
                <Save className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 px-4 pb-4 overflow-hidden">
          <div className="h-full overflow-y-auto rounded-md border bg-background/50">
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
    </div>
  );
}

export default MoveHistory;
