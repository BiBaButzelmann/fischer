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
import { savePGN } from "@/actions/pgn";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChess } from "@/contexts/chess-context";

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
  gameId: number;
};

function DownloadButton({ gameId }: DownloadButtonProps) {
  const { pgn } = useChess();
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
          const success = loadPgn(pgn);
          if (success) {
            toast.success("PGN erfolgreich geladen");
          } else {
            toast.error("Ungültige PGN-Datei");
          }
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
  gameId: number;
};

function SaveButton({ gameId }: SaveButtonProps) {
  const { pgn } = useChess();
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

function NavigationButtons() {
  const { moves, currentIndex, back, forward } = useChess();
  return (
    <div className="flex gap-2 ml-auto flex-1">
      <Button
        type="button"
        variant="outline"
        onClick={back}
        disabled={currentIndex <= -1}
        className="w-full h-12 touch-manipulation"
        style={{ touchAction: "manipulation" }}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={forward}
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
};

export function PgnViewerActions({ gameId }: PgnViewerActionsProps) {
  return (
    <div className="flex items-center mt-4 justify-center">
      <DownloadButton gameId={gameId} />
    </div>
  );
}

export function PgnViewerMobileActions() {
  return (
    <div className="flex items-center gap-2 ">
      <NavigationButtons />
    </div>
  );
}

type PgnEditorActionsProps = {
  gameId: number;
};

export function PgnEditorActions({ gameId }: PgnEditorActionsProps) {
  return (
    <div className="flex items-center mt-4">
      <div className="flex-1 flex justify-center">
        <SaveButton gameId={gameId} />
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex-1 flex justify-center gap-2">
        <DownloadButton gameId={gameId} />
        <UploadButton />
      </div>
    </div>
  );
}

type PgnEditorMobileActionsProps = {
  gameId: number;
};

export function PgnEditorMobileActions({
  gameId,
}: PgnEditorMobileActionsProps) {
  return (
    <div className="flex items-center gap-2 ">
      <SaveButton gameId={gameId} />

      <NavigationButtons />
    </div>
  );
}
