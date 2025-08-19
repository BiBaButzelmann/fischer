"use client";

import { generateFideReportFile } from "@/actions/fide-report";
import { Button } from "@/components/ui/button";
import { isError } from "@/lib/actions";
import { Download } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  selectedGroupId: string | undefined;
  selectedMonth: string | undefined;
  isDisabled?: boolean;
};

export function GenerateFideReportButton({
  selectedGroupId,
  selectedMonth,
  isDisabled,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    if (selectedGroupId == null || selectedMonth == null) {
      return;
    }

    startTransition(async () => {
      const result = await generateFideReportFile(
        parseInt(selectedGroupId),
        parseInt(selectedMonth),
      );
      if (isError(result)) {
        toast.error(result.error);
        return;
      }

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," +
          encodeURIComponent(result.fideReport),
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
      disabled={!selectedGroupId || !selectedMonth || isPending || isDisabled}
    >
      <Download className="h-4 w-4" />
      Elo-Auswertung generieren
    </Button>
  );
}
