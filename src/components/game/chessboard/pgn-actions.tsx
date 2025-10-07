"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Save, Download, Upload } from "lucide-react";
import { useCallback, useRef } from "react";
import { Move } from "chess.js";
import { downloadPGN, uploadPGN } from "@/lib/pgn-utils";

type DownloadButtonProps = {
  pgn: string;
  gameId: number;
  disabled?: boolean;
};

function DownloadButton({ pgn, gameId, disabled = false }: DownloadButtonProps) {
  const handleDownload = useCallback(() => {
    downloadPGN(pgn, gameId);
  }, [pgn, gameId]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          disabled={disabled}
        >
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
  pgn: string;
  gameId: number;
  setMoves: (moves: Move[]) => void;
  setCurrentIndex: (index: number) => void;
  disabled?: boolean;
};

function UploadButton({
  setMoves,
  setCurrentIndex,
  disabled = false,
}: UploadButtonProps) {
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
          <Button
            variant="outline"
            size="icon"
            onClick={handleUpload}
            disabled={disabled}
          >
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
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
};

function SaveButton({ onSave, isSaving, hasUnsavedChanges }: SaveButtonProps) {
  return (
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
  onSave: () => void;
  pgn: string;
  gameId: number;
  setMoves: (moves: Move[]) => void;
  setCurrentIndex: (index: number) => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
};

export function PgnEditorActions({
  onSave,
  pgn,
  gameId,
  setMoves,
  setCurrentIndex,
  isSaving = false,
  hasUnsavedChanges = false,
}: PgnEditorActionsProps) {
  return (
    <div className="flex items-center mt-4">
      <div className="flex-1 flex justify-center">
        <SaveButton
          onSave={onSave}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex-1 flex justify-center gap-2">
        <DownloadButton pgn={pgn} gameId={gameId} disabled={isSaving} />
        <UploadButton
          pgn={pgn}
          gameId={gameId}
          setMoves={setMoves}
          setCurrentIndex={setCurrentIndex}
          disabled={isSaving}
        />
      </div>
    </div>
  );
}
