import { auth } from "@/auth/utils";
import { GenerateFideReportButton } from "@/components/admin/fide-report/generate-fide-report-button";
import { GenerateFideReportSelector } from "@/components/admin/fide-report/generate-fide-report-selector";
import { PendingResultsList } from "@/components/notification/pending-results-list";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  getAllGroupNamesByTournamentId,
  getUncompletedGamesInMonth,
} from "@/db/repositories/game";
import { getLatestTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string; month?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    redirect("/uebersicht");
  }

  const { groupId, month } = await searchParams;

  const tournament = await getLatestTournament();
  if (!tournament) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fide Bericht</h1>
        <p>Kein aktives Turnier gefunden.</p>
      </div>
    );
  }

  const groups = await getAllGroupNamesByTournamentId(tournament.id);

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Elo-Auswertung</CardTitle>
          <CardDescription>
            Wähle eine Gruppe und einen Monat aus, um die Elo-Auswertung als
            .txt-Datei zu generieren und herunterzuladen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateFideReportSelector
            groups={groups}
            selectedGroupId={groupId}
            selectedMonth={month}
          />
        </CardContent>
        <CardFooter>
          <ButtonSection selectedGroupId={groupId} selectedMonth={month} />
        </CardFooter>
      </Card>
    </div>
  );
}

type Props = {
  selectedGroupId: string | undefined;
  selectedMonth: string | undefined;
};
async function ButtonSection({ selectedGroupId, selectedMonth }: Props) {
  if (selectedGroupId == null || selectedMonth == null) {
    return (
      <div className="flex justify-center">
        <GenerateFideReportButton
          isDisabled
          selectedGroupId={selectedGroupId}
          selectedMonth={selectedMonth}
        />
      </div>
    );
  }

  const groupId = parseInt(selectedGroupId);
  const month = parseInt(selectedMonth);

  const uncompletedGames = await getUncompletedGamesInMonth(groupId, month);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-center">
        <GenerateFideReportButton
          selectedGroupId={selectedGroupId}
          selectedMonth={selectedMonth}
          isDisabled={uncompletedGames.length > 0}
        />
      </div>
      {uncompletedGames.length > 0 && (
        <div className="w-full">
          <div className="text-center mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Ausstehende Ergebnisse
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Diese Partien müssen abgeschlossen werden, bevor der Bericht
              generiert werden kann.
            </p>
          </div>
          <div className="bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-lg">
            <div className="max-h-64 overflow-y-auto">
              <PendingResultsList games={uncompletedGames} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
