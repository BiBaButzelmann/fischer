"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Save, Download, Upload } from "lucide-react";

type PgnViewerActionsProps = {
  onDownload: () => void;
};

export function PgnViewerActions({ onDownload }: PgnViewerActionsProps) {
  return (
    <div className="flex items-center mt-4 justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>PGN herunterladen</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

type PgnEditorActionsProps = {
  onSave: () => void;
  onDownload: () => void;
  onUpload: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
};

export function PgnEditorActions({
  onSave,
  onDownload,
  onUpload,
  isSaving = false,
  hasUnsavedChanges = false,
}: PgnEditorActionsProps) {
  return (
    <div className="flex items-center mt-4">
      <div className="flex-1 flex justify-center">
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
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex-1 flex justify-center gap-2">
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
      </div>
    </div>
  );
}
