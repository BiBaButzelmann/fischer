"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Save, Download, Upload } from "lucide-react";
import { toGermanNotation } from "@/lib/chess-notation";
import { EnginePanel } from "./engine-panel";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  history: { san: string }[];
  currentMoveIndex: number;
  goToMove: (ply: number) => void;
  onSave?: () => void;
  onDownload?: () => void;
  onUpload?: () => void;
  isSaving?: boolean;
  showSave?: boolean;
  showUpload?: boolean;
  hasUnsavedChanges?: boolean;
  fen?: string;
};

export function MoveHistory({
  history,
  currentMoveIndex,
  goToMove,
  onSave,
  onDownload,
  onUpload,
  isSaving = false,
  showSave = false,
  showUpload = false,
  hasUnsavedChanges = false,
  fen,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentMoveRef = useRef<HTMLTableCellElement>(null);
  const isMobile = useIsMobile();

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
        <td className="pl-2 pr-1 py-1.5 text-left select-none text-muted-foreground font-medium min-w-[1.5rem] text-xs">
          {i / 2 + 1}.
        </td>
        <td
          ref={currentMoveIndex === whitePly ? currentMoveRef : null}
          className={clsx(
            "px-2 py-1.5 cursor-pointer rounded-sm transition-all duration-150 font-mono text-sm min-w-[3rem]",
            "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
            currentMoveIndex === whitePly
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-foreground",
          )}
          onClick={() => goToMove(whitePly)}
        >
          {white ? toGermanNotation(white.san) : "…"}
        </td>
        <td
          ref={currentMoveIndex === blackPly && black ? currentMoveRef : null}
          className={clsx(
            "px-2 py-1.5 rounded-sm transition-all duration-150 font-mono text-sm min-w-[3rem]",
            black
              ? "cursor-pointer hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
              : "cursor-default",
            currentMoveIndex === blackPly && black
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-foreground",
          )}
          onClick={black ? () => goToMove(blackPly) : undefined}
        >
          {black ? toGermanNotation(black.san) : "…"}
        </td>
      </tr>,
    );
  }

  return (
    <div className="w-full flex flex-col h-full max-h-[570px]">
      <div className="h-full rounded-lg border border-gray-200 bg-card text-card-foreground shadow-sm flex flex-col">
        {fen && !isMobile && <EnginePanel fen={fen} />}
        <div
          className={`flex-1 overflow-hidden ${fen && !isMobile ? "border-t" : ""}`}
        >
          <div className="h-full px-4 pt-4 pb-4">
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
        <div className="px-4 pb-4 border-t flex-shrink-0">
          <div className="flex items-center mt-4">
            <div className="flex-1 flex justify-center">
              {showSave && onSave && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={hasUnsavedChanges ? "default" : "outline"}
                      size="icon"
                      onClick={onSave}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isSaving ? "Speichern..." : "Speichern"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {(onDownload || (showUpload && onUpload)) && showSave && onSave && (
              <div className="w-px h-8 bg-border" />
            )}

            <div className="flex-1 flex justify-center gap-2">
              {onDownload && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onDownload}
                      disabled={isSaving}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>PGN herunterladen</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {showUpload && onUpload && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onUpload}
                      disabled={isSaving}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>PGN hochladen</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
