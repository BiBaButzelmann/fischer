"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Save,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCallback, useRef, useTransition, useState, useMemo } from "react";
import { Chess, Move } from "chess.js";
import { savePGN } from "@/actions/pgn";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChess } from "@/contexts/chess-context";

export function movesFromPGN(pgn: string): Move[] {
  const game = new Chess();
  game.loadPgn(pgn);
  return game.history({ verbose: true });
}

function downloadPGN(pgn: string, gameId: number) {
  const blob = new Blob([pgn], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `game-${gameId}.pgn`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("PGN erfolgreich heruntergeladen");
}

type DownloadButtonProps = {
  pgn: string;
  gameId: number;
};

function DownloadButton({ pgn, gameId }: DownloadButtonProps) {
  const handleDownload = useCallback(() => {
    downloadPGN(pgn, gameId);
  }, [pgn, gameId]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={handleDownload}>
          <Download className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>PGN herunterladen</p>
      </TooltipContent>
    </Tooltip>
  );
}

function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadPgn } = useChess();

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const pgn = e.target?.result as string;
        if (pgn) {
          loadPgn(pgn);
        }
      };
      reader.readAsText(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [loadPgn],
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pgn"
        className="hidden"
        aria-hidden="true"
        onChange={handleFileChange}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={handleUpload}>
            <Upload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>PGN hochladen</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}

type SaveButtonProps = {
  pgn: string;
  gameId: number;
};

function SaveButton({ pgn, gameId }: SaveButtonProps) {
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [savedPGN, setSavedPGN] = useState(pgn);

  const hasUnsavedChanges = useMemo(() => {
    return pgn !== savedPGN;
  }, [pgn, savedPGN]);

  const handleSave = useCallback(() => {
    startTransition(async () => {
      const result = await savePGN(pgn, gameId);

      if (result?.error) {
        toast.error("Fehler beim Speichern der Partie");
      } else {
        toast.success("Partie erfolgreich gespeichert");
        setSavedPGN(pgn);
      }
    });
  }, [pgn, gameId]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={hasUnsavedChanges ? "default" : "outline"}
          size={isMobile ? "default" : "icon"}
          className={isMobile ? "h-12 px-4" : ""}
          onClick={handleSave}
          disabled={isPending}
        >
          <Save className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isPending ? "Speichern..." : "Speichern"}</p>
      </TooltipContent>
    </Tooltip>
  );
}

type NavigationButtonsProps = {
  moves: Move[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
};

function NavigationButtons({
  moves,
  currentIndex,
  setCurrentIndex,
}: NavigationButtonsProps) {
  return (
    <div className="flex gap-2 ml-auto flex-1">
      <Button
        type="button"
        variant="outline"
        onClick={() => setCurrentIndex(Math.max(-1, currentIndex - 1))}
        disabled={currentIndex <= -1}
        className="w-full h-12 touch-manipulation"
        style={{ touchAction: "manipulation" }}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setCurrentIndex(Math.min(moves.length - 1, currentIndex + 1))
        }
        disabled={currentIndex >= moves.length - 1}
        className="w-full h-12 touch-manipulation"
        style={{ touchAction: "manipulation" }}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

type PgnViewerActionsProps = {
  gameId: number;
  pgn: string;
};

export function PgnViewerActions({ gameId, pgn }: PgnViewerActionsProps) {
  return (
    <div className="flex items-center mt-4 justify-center">
      <DownloadButton pgn={pgn} gameId={gameId} />
    </div>
  );
}

type PgnViewerMobileActionsProps = {
  moves: Move[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
};

export function PgnViewerMobileActions({
  moves,
  currentIndex,
  setCurrentIndex,
}: PgnViewerMobileActionsProps) {
  return (
    <div className="flex items-center gap-2 ">
      <NavigationButtons
        moves={moves}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  );
}

type PgnEditorActionsProps = {
  gameId: number;
  pgn: string;
};

export function PgnEditorActions({ gameId, pgn }: PgnEditorActionsProps) {
  return (
    <div className="flex items-center mt-4">
      <div className="flex-1 flex justify-center">
        <SaveButton pgn={pgn} gameId={gameId} />
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex-1 flex justify-center gap-2">
        <DownloadButton pgn={pgn} gameId={gameId} />
        <UploadButton />
      </div>
    </div>
  );
}

type PgnEditorMobileActionsProps = {
  gameId: number;
  pgn: string;
  moves: Move[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
};

export function PgnEditorMobileActions({
  gameId,
  pgn,
  moves,
  currentIndex,
  setCurrentIndex,
}: PgnEditorMobileActionsProps) {
  return (
    <div className="flex items-center gap-2 ">
      <SaveButton pgn={pgn} gameId={gameId} />

      <NavigationButtons
        moves={moves}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  );
}
