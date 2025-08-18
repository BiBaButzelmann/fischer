"use client";

import { generateFideReportFile } from "@/actions/fide-report";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { monthLabels } from "@/constants/constants";
import { GroupSummary } from "@/db/types/group";
import { isError } from "@/lib/actions";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";

type Props = {
  groups: GroupSummary[];
  selectedGroupId?: string;
  selectedMonth?: string;
  isDisabled?: boolean;
};

export function GenerateFideReport({
  groups,
  selectedGroupId,
  selectedMonth,
  isDisabled,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const buildUrl = (params: { groupId?: string; month?: string }) => {
    const searchParams = new URLSearchParams();

    if (params.groupId) {
      searchParams.set("groupId", params.groupId);
    }

    if (params.month) {
      searchParams.set("month", params.month);
    }

    return `/admin/fide-bericht?${searchParams.toString()}`;
  };

  const handleGroupChange = (groupId: string) => {
    router.push(
      buildUrl({
        groupId,
        month: selectedMonth,
      }),
    );
  };

  const handleMonthChange = (month: string) => {
    router.push(
      buildUrl({
        groupId: selectedGroupId,
        month,
      }),
    );
  };

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
    <div className="flex h-full w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Elo-Auswertung</CardTitle>
          <CardDescription>
            Wählen Sie eine Gruppe und einen Monat aus, um die Elo-Auswertung
            als .txt-Datei zu generieren und herunterzuladen.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="gruppe">Gruppe</Label>
            <Select value={selectedGroupId} onValueChange={handleGroupChange}>
              <SelectTrigger id="gruppe">
                <SelectValue placeholder="Gruppe auswählen" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.groupName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="monat">Monat</Label>
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger id="monat">
                <SelectValue placeholder="Monat auswählen" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.toString()} value={month.toString()}>
                    {monthLabels[month - 1]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full gap-2"
            onClick={handleDownload}
            disabled={
              !selectedGroupId || !selectedMonth || isPending || isDisabled
            }
          >
            <Download className="h-4 w-4" />
            Elo-Auswertung generieren
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
