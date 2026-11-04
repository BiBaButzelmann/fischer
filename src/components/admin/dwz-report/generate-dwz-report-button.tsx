"use client";

import { generateDwzReportFile } from "@/actions/dwz-report";
import { Button } from "@/components/ui/button";
import { isError } from "@/lib/actions";
import { Download } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  selectedGroupId: string | undefined;
  isDisabled?: boolean;
  isPreview?: boolean;
};

export function GenerateDwzReportButton({
  selectedGroupId,
  isDisabled,
  isPreview,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    if (selectedGroupId == null) {
      return;
    }

    startTransition(async () => {
      const result = await generateDwzReportFile(
        parseInt(selectedGroupId),
        isPreview,
      );
      if (isError(result)) {
        toast.error(result.error);
        return;
      }

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(result.dwzReport),
      );
      element.setAttribute("download", result.fileName);

      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  };

  return (
    <Button
      className="w-full gap-2"
      onClick={handleDownload}
      disabled={!selectedGroupId || isPending || isDisabled}
    >
      <Download className="h-4 w-4" />
      {isPreview
        ? "Vorschau-Bericht (TRF) generieren"
        : "DWZ-Auswertung (TRF) generieren"}
    </Button>
  );
}
