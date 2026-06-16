import { auth } from "@/auth/utils";
import { GenerateDwzReportButton } from "@/components/admin/dwz-report/generate-dwz-report-button";
import { GenerateDwzReportSelector } from "@/components/admin/dwz-report/generate-dwz-report-selector";
import { PendingResultItem } from "@/components/notification/pending-result-item";
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
  getUncompletedGamesByGroup,
} from "@/db/repositories/game";
import { getLatestTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    redirect("/uebersicht");
  }

  const { groupId } = await searchParams;

  const tournament = await getLatestTournament();
  if (!tournament) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DWZ Bericht</h1>
        <p>Kein aktives Turnier gefunden.</p>
      </div>
    );
  }

  const groups = await getAllGroupNamesByTournamentId(tournament.id);

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>DWZ-Auswertung</CardTitle>
          <CardDescription>
            Wähle eine Gruppe aus, um die DWZ-Auswertung als .txt-Datei zu
            generieren und herunterzuladen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateDwzReportSelector
            groups={groups}
            selectedGroupId={groupId}
          />
        </CardContent>
        <CardFooter>
          <ButtonSection selectedGroupId={groupId} />
        </CardFooter>
      </Card>
    </div>
  );
}

type Props = {
  selectedGroupId: string | undefined;
};
async function ButtonSection({ selectedGroupId }: Props) {
  if (selectedGroupId == null) {
    return (
      <div className="flex justify-center">
        <GenerateDwzReportButton
          isDisabled
          selectedGroupId={selectedGroupId}
        />
      </div>
    );
  }

  const groupId = parseInt(selectedGroupId);

  const uncompletedGameIds = await getUncompletedGamesByGroup(groupId);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-center">
        <GenerateDwzReportButton
          selectedGroupId={selectedGroupId}
          isDisabled={uncompletedGameIds.length > 0}
        />
      </div>
      {uncompletedGameIds.length > 0 && (
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
              <PendingResultsList
                items={uncompletedGameIds.map((gameId: number) => (
                  <PendingResultItem key={gameId} gameId={gameId} />
                ))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}