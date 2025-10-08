"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Save, Download, Upload } from "lucide-react";
import { useCallback, useRef, useTransition, useState, useMemo } from "react";
import { Chess, Move } from "chess.js";
import { savePGN } from "@/actions/pgn";
import { toast } from "sonner";

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

function uploadPGN(file: File, onSuccess: (moves: Move[]) => void): void {
  if (!file.name.toLowerCase().endsWith(".pgn")) {
    toast.error("Bitte wähle eine .pgn Datei aus.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (!content?.trim()) {
      toast.error("PGN darf nicht leer sein.");
      return;
    }

    try {
      const newMoves = movesFromPGN(content.trim());
      onSuccess(newMoves);
      toast.success("PGN erfolgreich hochgeladen");
    } catch {
      toast.error("Ungültige PGN-Datei");
    }
  };
  reader.readAsText(file);
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

type UploadButtonProps = {
  setMoves: (moves: Move[]) => void;
  setCurrentIndex: (index: number) => void;
};

function UploadButton({ setMoves, setCurrentIndex }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      uploadPGN(file, (newMoves) => {
        setMoves(newMoves);
        setCurrentIndex(newMoves.length - 1);
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [setMoves, setCurrentIndex],
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
          size="icon"
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

type PgnViewerActionsProps = {
  pgn: string;
  gameId: number;
};

export function PgnViewerActions({ pgn, gameId }: PgnViewerActionsProps) {
  return (
    <div className="flex items-center mt-4 justify-center">
      <DownloadButton pgn={pgn} gameId={gameId} />
    </div>
  );
}

type PgnEditorActionsProps = {
  pgn: string;
  gameId: number;
  setMoves: (moves: Move[]) => void;
  setCurrentIndex: (index: number) => void;
};

export function PgnEditorActions({
  pgn,
  gameId,
  setMoves,
  setCurrentIndex,
}: PgnEditorActionsProps) {
  return (
    <div className="flex items-center mt-4">
      <div className="flex-1 flex justify-center">
        <SaveButton pgn={pgn} gameId={gameId} />
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex-1 flex justify-center gap-2">
        <DownloadButton pgn={pgn} gameId={gameId} />
        <UploadButton setMoves={setMoves} setCurrentIndex={setCurrentIndex} />
      </div>
    </div>
  );
}
